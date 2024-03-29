import * as path from 'path'

import chokidar from 'chokidar'
import bodyParser from 'body-parser'
import debounce from 'lodash.debounce'
import { Express } from 'express'

import { mountMockRouter, unmountMockRouter } from './router'
import { Options, MockConfig } from './types'
import { logger, g } from './utils'

export function buildBefore(options: Options = {}) {
    const before = options.before
    const mockConfigPath = options.configPath || path.resolve(process.cwd(), './mock.js')
    const reloadDelay = options.reloadDelay >= 0 ? options.reloadDelay : 300

    g.options = options

    function importMockConfig(): MockConfig {
        let ret = null
        try {
            ret = require(mockConfigPath)
        } catch(e) {
            logger.error('An error occured when importing mock config:')
            console.error(e)
        }

        return ret
    }

    function reloadMockRouter(app: Express) {
        const mockConfig = importMockConfig()
        if (mockConfig) {
            unmountMockRouter(app)
            mountMockRouter(app, mockConfig)
            logger.info('Reloaded all mocking APIs.')
        }
    }

    function onConfigChange(app: Express) {
        delete require.cache[mockConfigPath]
        reloadMockRouter(app)
    }

    function startWatchConfig(onChange: () => {}) {
        const watcher = chokidar.watch(mockConfigPath)
        watcher.on('ready', () => {
            watcher.on('all', debounce(onChange, reloadDelay))
        })
    }

    return function _before(app: Express) {
        app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
        app.use(bodyParser.json())

        const mockConfig = importMockConfig()
        if (mockConfig) {
            mountMockRouter(app, mockConfig)
        }

        startWatchConfig(onConfigChange.bind(null, app))
        logger.info('Mocking service is started.')

        before && before(app)
    }
}
