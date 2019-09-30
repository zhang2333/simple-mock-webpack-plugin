import { Mockjs, MockjsMock } from 'mockjs'
import { Request, Response } from 'express'

export interface Options {
    log?: boolean
    before?: Function
    configPath?: string
    reloadDelay?: number
}

export interface MockConfig {
    prefix?: string
    delay?: number
    apis: MockAPI[]
}

export interface ExtraOptions {
    state?: object
    request?: Request
    response?: Response
    Mock: Mockjs
}

export type MockAPIHandler = (mock: MockjsMock, options: ExtraOptions) => object|Promise<object>

export type MockAPITemplate = object | MockAPIHandler

export interface MockAPI {
    url: string
    method?: string
    template: MockAPITemplate
}
