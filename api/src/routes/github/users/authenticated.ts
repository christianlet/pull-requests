import { RequestHandler } from 'express'
import { OctokitClient } from '../../../clients/octokit-client'
import { WithUserRequest } from '../../types'


export const authenticated: RequestHandler = async (req: WithUserRequest, res) => {
    const client = OctokitClient.getInstance(req.user)
    const { data } = await client.users.getAuthenticated()

    res.status(200).json({
        item: data
    })
}