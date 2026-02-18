import { Router } from 'express'
import { githubSearchRouter } from './search'
import { githubUsersRouter } from './users'

export const githubRouter = Router()

githubRouter.use((req, res, next) => {
    const token = req.headers.token

    if (!token) {
        return res.status(401).json({
            error: 'Missing GitHub PAT'
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = token

    next()
})

githubRouter.use('/users', githubUsersRouter)
githubRouter.use('/search', githubSearchRouter)