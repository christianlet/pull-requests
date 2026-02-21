import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { RequestHandler } from 'express'
import { OctokitClient } from '../../../clients/octokit-client'
import { getFullPullRequests } from '../../../utilities/github'
import { WithUserRequest } from '../../types'

export const pullRequest: RequestHandler = async (
    req: WithUserRequest,
    res
) => {
    const octokit = OctokitClient.getInstance(req.user)
    let q = 'is:pr'

    if (req.query.q && typeof req.query.q === 'string') {
        q = `is:pr+${req.query.q.replace('is:pr', '')}`
    }

    const requestParams: RestEndpointMethodTypes['search']['issuesAndPullRequests']['parameters'] = {
        sort: 'updated',
        per_page: 50,
        page: 1,
        ...req.query,
        q
    }

    const { data } = await octokit.request('GET /search/issues', requestParams)
    const pullRequests = await getFullPullRequests(
        octokit,
        data.items,
        req.query.hardFetch === 'true'
    )

    res.status(200).json({
        items: pullRequests,
        totalCount: data.total_count
    })
}
