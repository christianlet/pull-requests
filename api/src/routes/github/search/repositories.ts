import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { Octokit } from '@octokit/rest'
import { RequestHandler } from 'express'
import { OctokitClient } from '../../../clients/octokit-client'
import { getRepositories } from '../../../utilities/github/getRepositories'
import { WithUserRequest } from '../../types'


export const repositories: RequestHandler = async (
    req: WithUserRequest,
    res
) => {
    const octokit = OctokitClient.getInstance(req.user)
    let q = ''

    if (req.query.q && typeof req.query.q === 'string') {
        q = req.query.q
    }

    const requestParams: RestEndpointMethodTypes['search']['repos']['parameters'] = {
        sort: 'updated',
        per_page: 100,
        page: 1,
        ...req.query,
        q
    }

    const { data } = await octokit.request('GET /search/repositories', requestParams)
    const pullRequests = await getRepositories(
        octokit,
        data.items,
        req.query.hardFetch === 'true'
    )

    res.status(200).json({
        items: pullRequests,
        totalCount: data.total_count
    })
}

const getAllRepositories = async (octokit: Octokit, page: number, q: string) => {
    const response = {
        items: [],
        total: 0
    }
    const { data: initialFetch } = await octokit.request('GET /search/repositories', {
        sort: 'updated',
        per_page: 100,
        page: 1,
        q
    })

    if (initialFetch.total_count > 100) {
        const pages = initialFetch.total_count / 100
    }
}