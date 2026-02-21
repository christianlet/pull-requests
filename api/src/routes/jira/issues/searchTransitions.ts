import { RequestHandler } from 'express'
import { Jira } from '../../../clients/jira'
import { WithUserRequest } from '../../types'


export const searchTransitions: RequestHandler = async (
    req: WithUserRequest,
    res
) => {
    const client = Jira.getInstance(req.user!)
    const issue = await client.searchTransitions(req.params.issueId as string)

    return res.status(200).json(issue)
}