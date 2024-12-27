import { PullRequestFull } from '../types/api-types'
import { SessionStorage } from './git-api/local-storage/session-storage'
import { OctokitClient } from './octokit-client'
import { RestEndpointMethodTypes } from '@octokit/rest'

export const getBranchPrs = async (query: string) => {
    const cache = new SessionStorage<PullRequestFull>('peerReviews')
    const octokit = await OctokitClient.getInstance()
    const prs = await octokit.search.issuesAndPullRequests({
        q: query,
        sort: 'updated'
    })

    const data: RestEndpointMethodTypes["pulls"]["get"]["response"]["data"][] = []

    for (const item of prs.data.items) {
        const cachedItem = cache.get(item.id)
        const repositoryUrl = item.repository_url.split('/')
        const repo = repositoryUrl.pop()
        const owner = repositoryUrl.pop()
        const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)

        if(owner && repo && pullNumber) {
            try{
                const pr = await octokit.pulls.get({
                    owner: owner,
                    repo: repo,
                    pull_number: pullNumber,
                    headers: {
                        'If-Modified-Since': cachedItem?.lastModifiedSince || ''
                    }
                })

                data.push(pr.data)
            } catch(e: any) {
                if(e.status === 304 && cachedItem) {
                    data.push(cachedItem)
                }
            }
        }
    }

    return data
}
