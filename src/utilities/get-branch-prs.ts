import { OctokitClient } from './octokit-client'
import { RestEndpointMethodTypes } from '@octokit/rest'

export const getBranchPrs = async (query: string) => {
    const octokit = await OctokitClient.getInstance()
    const prs = await octokit.search.issuesAndPullRequests({
        q: query
    })

    const data: RestEndpointMethodTypes["pulls"]["get"]["response"]["data"][] = []

    for (const item of prs.data.items) {
        const repositoryUrl = item.repository_url.split('/')
        const repo = repositoryUrl.pop()
        const owner = repositoryUrl.pop()
        const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)

        if(owner && repo && pullNumber) {
            const pr = await octokit.pulls.get({
                owner: owner,
                repo: repo,
                pull_number: pullNumber
            })

            data.push(pr.data)
        }
    }

    return data
}
