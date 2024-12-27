import { RestEndpointMethodTypes } from '@octokit/rest'
import { PullRequestFull, Reviewer, TicketsState } from '../../../types/api-types'
import { SessionStorage } from '../local-storage/session-storage'
import { getOpenPullRequests } from '../search/get-open-pull-requests'
import { getUserInfo } from '../users/get-user-info'
import { getPullRequest } from './get-pull-request'
import { getPullRequestReviews } from './get-pull-request-reviews'
import { jiraTicket } from '../../jira-ticket'

type GhUser = RestEndpointMethodTypes["users"]["getByUsername"]["response"]['data']

interface PullRequestWithPagination {
    tickets: TicketsState[],
    totalCount: number
}

export const getPullRequests = async (
    author: string,
    reviewing: boolean,
    state: 'open' | 'closed',
    page: string
): Promise<PullRequestWithPagination> => {
    const { total_count, items: openPullRequests } = await getOpenPullRequests(reviewing, author, state, page)
        .catch(e => ({
            total_count: 0,
            items: []
        }))
    const prStorage = new SessionStorage<PullRequestFull>('peerReviews')
    const userStorage = new SessionStorage<GhUser>('githubUsers')
    const results = await Promise.all(openPullRequests.map(async (item) => {
        const repositoryUrl = item.repository_url.split('/')
        const repo = repositoryUrl.pop()
        const owner = repositoryUrl.pop()
        const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)
        let reviewers: Reviewer[] = []
        let newItem

        try {
            if (repo && owner && pullNumber && item.pull_request?.url ) {
                const localStorage = prStorage.get(item.id)
                const { headers, data } = await getPullRequest({
                    owner,
                    repo,
                    pull_number: pullNumber
                }, localStorage?.lastModifiedSince || '')

                const reviews = await getPullRequestReviews(owner, repo, pullNumber)

                reviewers = await Promise.all(reviews
                    .filter(r => r.state === 'APPROVED' || r.state === 'CHANGES_REQUESTED')
                    .map(async r => {
                        let user = userStorage.get(r.user?.login ?? '')

                        if(!user) {
                            user = await getUserInfo(r.user?.login ?? '')

                            userStorage.store(user.login, user)
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

                prStorage.store(item.id, newItem)
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
        tickets: groupPeerReviews(results.filter(Boolean) as PullRequestFull[]),
        totalCount: total_count
    }
}

const groupPeerReviews = (prs: PullRequestFull[]) => {
    const groupedPRs: any[] = []

    prs?.forEach(pr => {
        const ticket  = pr.head.ref.split('/').pop() ?? ''
        const link = jiraTicket(ticket)
        const prIndex = groupedPRs.findIndex(repo => repo.info.number === ticket)

        if(prIndex === -1) {
            groupedPRs.push({
                info: {
                    number: ticket,
                    link
                },
                repos: [pr]
            })
        } else {
            groupedPRs[prIndex].repos.push(pr)
        }
    })

    return groupedPRs
}