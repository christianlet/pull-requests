import { RestEndpointMethodTypes } from '@octokit/rest'
import { PullRequestFull, Reviewer } from '../../../types/api-types'
import { Api } from '../storage/api'
import { searchOpenPullRequests } from '../search/get-open-pull-requests'
import { getUserInfo } from '../users/get-user-info'
import { getPullRequest } from './get-pull-request'
import { getPullRequestReviews } from './get-pull-request-reviews'

type GhUser = RestEndpointMethodTypes["users"]["getByUsername"]["response"]['data']

interface PullRequestWithPagination {
    items: PullRequestFull[],
    totalCount: number
}

type Arguments = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["parameters"] & {
    hardFetch?: boolean
}

export const getPullRequests = async (args: Arguments): Promise<PullRequestWithPagination> => {
    const searchResponse = await searchOpenPullRequests(args).catch(e => null)

    if(!searchResponse) {
        return {
            items: [],
            totalCount: 0
        }
    }

    const prStorage = new Api<PullRequestFull>('pull-requests')
    const userStorage = new Api<GhUser>('users')
    const results = await Promise.all(searchResponse.data.items.map(async (item) => {
        const repositoryUrl = item.repository_url.split('/')
        const repo = repositoryUrl.pop()
        const owner = repositoryUrl.pop()
        const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)
        let reviewers: Reviewer[] = []
        let newItem

        try {
            if (repo && owner && pullNumber && item.pull_request?.url ) {
                const localStorage = await prStorage.get(item.id)
                const { headers, data } = await getPullRequest({
                    owner,
                    repo,
                    pull_number: pullNumber
                }, args.hardFetch ? '' : (localStorage?.lastModifiedSince || ''))

                const reviews = await getPullRequestReviews(owner, repo, pullNumber)

                reviewers = await Promise.all(reviews
                    .filter(r => r.state === 'APPROVED' || r.state === 'CHANGES_REQUESTED')
                    .map(async r => {
                        let user = await userStorage.get(r.user?.login ?? '')

                        if(!user) {
                            user = await getUserInfo(r.user?.login ?? '')

                            userStorage.create(user.login, user)
                        }

                        return {
                            ...r,
                            user
                        }
                    }))

                newItem = {
                    ...data,
                    lastModifiedSince: headers['last-modified'],
                    reviewers
                }

                prStorage.create(item.id, newItem)
            }
        } catch (error: any) {
            if(error.status === 304) {
                return prStorage.get(item.id)
            } else {
                console.error(error)
            }
        }

        return newItem
    }))

    return {
        items: results.filter(Boolean) as PullRequestFull[],
        totalCount: searchResponse.data.total_count
    }
}
