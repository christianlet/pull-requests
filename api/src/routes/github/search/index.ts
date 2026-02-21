import { Router } from 'express'
import { pullRequest } from './pull-request'
import { repositories } from './repositories'


export const githubSearchRouter = Router()

githubSearchRouter.get('/pull-requests', pullRequest)
githubSearchRouter.get('/repositories', repositories)