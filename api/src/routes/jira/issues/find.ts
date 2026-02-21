import { RequestHandler } from 'express'
import { Jira } from '../../../clients/jira'
import { WithUserRequest } from '../../types'

export const find: RequestHandler = async (
    req: WithUserRequest,
    res
) => {
    console.log(req.params.issueId)

    const client = Jira.getInstance(req.user!)
    const issue = await client.getIssue(req.params.issueId as string)

    return res.status(200).json(issue)
}