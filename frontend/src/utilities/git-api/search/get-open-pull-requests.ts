import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

type SearchOpenPullRequestsParameters = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["parameters"]

export const searchOpenPullRequests = async (args: SearchOpenPullRequestsParameters): Promise<RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["response"]> => {
    const octokit = await OctokitClient.getInstance()
    const res = await octokit.search.issuesAndPullRequests({
        sort: 'updated',
        per_page: 50,
        page: 1,
        ...args,
        q: `${args.q.replace('is:pr', '')}+is:pr`,
    })

    return res
}