import chalk from 'chalk'
import { Options } from './types'

export const wait = (t: number): Promise<void> => new Promise(res => setTimeout(res, t))

// Globals
export const g = {
    options: <Options> null
}

function log(msg: string) {
    if (g.options.log === false) return

    const prefix = chalk.cyan('[SimpleMock] ')
    console.log(prefix + msg)
}

export const logger = {
    info(msg: string) {
        log(msg)
    },

    warn(msg: string) {
        log(chalk.yellow(msg))
    },

    error(msg: string) {
        log(chalk.red(msg))
    },
}
