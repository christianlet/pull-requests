import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { Octokit } from '@octokit/rest'
import { RequestHandler } from 'express'
import { WithId } from 'mongodb'
import { OctokitClient } from '../../../clients/octokit-client'
import { Repository } from '../../../types/collections/repository'
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
        ...req.query,
        q
    }

    const allRepositories = await getAllRepositories(octokit, req.query.hardFetch === 'true', requestParams)

    res.status(200).json({
        items: allRepositories,
        totalCount: allRepositories.total
    })
}

const getAllRepositories = async (
    octokit: Octokit,
    hardFetch: boolean,
    requestParams: RestEndpointMethodTypes['search']['repos']['parameters']
) => {
    const response = {
        items: [] as WithId<Repository>[],
        total: 0
    }
    let currentPage = 1
    const { data: initialFetch } = await octokit.request('GET /search/repositories', {
        ...requestParams,
        page: currentPage
    })

    response.items = await getRepositories(octokit, initialFetch.items, hardFetch)
    response.total = initialFetch.total_count

    if (initialFetch.total_count > 100) {
        const pages = initialFetch.total_count / 100

        while (currentPage <= pages) {
            currentPage++

            const { data } = await octokit.request('GET /search/repositories', {
                ...requestParams,
                page: currentPage
            })

            response.items.push(
                ...await getRepositories(octokit, data.items, hardFetch)
            )
        }
    }

    return response
}