import { Router, Express, Request, Response } from 'express'
import Mock from 'mockjs'

import { wait, logger } from './utils'
import { MockConfig, MockAPI, MockAPITemplate, MockAPIHandler } from './types'

const MOCK_MARK = '_isMock'

function delayMiddleware(time: number) {
    return (_, __, next) => {
        wait(time).then(next)
    }
}

function buildMockRouter(mockConfig: MockConfig) {
    const router = Router()
    router[MOCK_MARK] = true

    router.use(delayMiddleware(mockConfig.delay || 0))

    const _mock = Mock.mock.bind(Mock)
    const state = {}

    function isHandler(temp: MockAPITemplate): temp is MockAPIHandler {
        return typeof temp === 'function'
    }

    function mountAPI(api: MockAPI) {
        const method = api.method ? api.method.toLowerCase() : 'all'
        router[method](api.url, async (req: Request, resp: Response) => {
            let ret: object|Promise<object> = {}

            if (isHandler(api.template)) {
                ret = api.template(_mock, {
                    state,
                    request: req,
                    response: resp,
                    Mock
                })

                if (ret instanceof Promise) {
                    ret = await ret
                }
            } else {
                ret = Mock.mock(api.template)
            }

            if (resp.headersSent) return

            if (typeof ret === 'object') {
                resp.json(ret)
            } else {
                resp.send(ret)
            }
        })
    }

    for (let api of mockConfig.apis) {
        if (
            typeof api !== 'object'
                || !api.url
                || !api.template
                || typeof api.template !== 'object' && typeof api.template !== 'function'
        ) {
            logger.warn('Invalid mocking api: ' + api.url)
        } else {
            mountAPI(api)
        }
    }

    return router
}

export function mountMockRouter(app: Express, mockConfig: MockConfig) {
    const router = buildMockRouter(mockConfig)
    app.use(mockConfig.prefix || '/', router)
}

export function unmountMockRouter(app: Express) {
    const stack = app._router.stack
    const mockRouter = stack.filter(layer => layer.handle && layer.handle[MOCK_MARK])[0]
    const idx = stack.indexOf(mockRouter)
    stack.splice(idx, 1)
}
