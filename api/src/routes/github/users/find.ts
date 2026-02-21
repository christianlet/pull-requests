import { RequestHandler } from 'express'
import { OctokitClient } from '../../../clients/octokit-client'
import { WithUserRequest } from '../../types'



export const find: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        const octokit = OctokitClient.getInstance((req as WithUserRequest<{ id: string }>).user)
        const { data } = await octokit.users.getByUsername({
            username: req.params.id
        })

        res.status(200).json({
            item: data ?? null
        })
    } catch (err) {
        console.log(err)

        res.status(500).json({ error: 'Failed to fetch item' })
    }
}