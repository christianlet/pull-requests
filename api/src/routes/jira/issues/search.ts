import { RequestHandler } from 'express'
import { Jira } from '../../../clients/jira'
import { WithUserRequest } from '../../types'

interface RequestBody {
    issues: string[]
}

export const search: RequestHandler = async (
    req: WithUserRequest<object, unknown, RequestBody>,
    res
) => {
    const client = Jira.getInstance(req.user!)
    const issue = await client.searchIssues(req.body.issues)

    return res.status(200).json(issue)
}