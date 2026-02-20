import { Router } from 'express'
import { pullRequestRouter } from './pull-requests'
import { releasesRouter } from './releases'
import { teamsRouter } from './teams'
import { usersRouter } from './users'

export const collectionsRouter = Router()

collectionsRouter.use('/pull-requests', pullRequestRouter)
collectionsRouter.use('/users', usersRouter)
collectionsRouter.use('/releases', releasesRouter)
collectionsRouter.use('/teams', teamsRouter)