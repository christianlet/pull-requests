/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'

interface WithHardFetch extends Query {
    hardFetch?: string
}

export interface WithUserRequest<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = WithHardFetch,
    Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    user?: string
}