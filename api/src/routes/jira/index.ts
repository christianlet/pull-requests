import { Router } from 'express'
import { jiraIssueRouter } from './issues'


export const jiraRouter = Router()

jiraRouter.use((req, res, next) => {
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({
            error: 'Missing auth token'
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = token

    next()
})

jiraRouter.use('/issues', jiraIssueRouter)