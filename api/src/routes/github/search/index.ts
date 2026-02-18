import { Router } from 'express'
import { pullRequest } from './pull-request'


export const githubSearchRouter = Router()

githubSearchRouter.get('/pull-requests', pullRequest)