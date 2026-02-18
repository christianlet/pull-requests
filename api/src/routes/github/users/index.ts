
import { Router } from 'express'
import { authenticated } from './authenticated'
import { find } from './find'
import { search } from './search'


export const githubUsersRouter = Router()

githubUsersRouter.get('/', search)
githubUsersRouter.get('/authenticated', authenticated)
githubUsersRouter.get('/:id', find)