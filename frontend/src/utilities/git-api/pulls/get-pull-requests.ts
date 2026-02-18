import { RestEndpointMethodTypes } from '@octokit/rest'
import { ApiClient } from '../../../clients/ApiClient'
import { PullRequestFull } from '../../../types/api-types'


interface PullRequestWithPagination {
    items: PullRequestFull[],
    totalCount: number
}

type Arguments = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["parameters"] & {
    hardFetch?: boolean
}

export const getPullRequests = async (args: Arguments): Promise<PullRequestWithPagination> => {
    const client = ApiClient.getInstance()

    return client.request('/github/search/pull-requests', {
        searchParams: args
    })
}
