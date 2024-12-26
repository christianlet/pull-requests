import { RestEndpointMethodTypes } from '@octokit/rest'
import { TicketsState } from '../../../types/api-types'
import { SessionStorage } from '../local-storage/session-storage'
import { getOpenPullRequests } from '../search/get-open-pull-requests'
import { getAuthenticatedUser } from '../users/get-authenticated-user'
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
    const prStorage = new SessionStorage('peerReviews')
    const userStorage = new SessionStorage<GhUser>('githubUsers')
    const userInfo = author === '@me' ? await getAuthenticatedUser() : await getUserInfo(author)
    const results = await Promise.all(openPullRequests.map(async (item) => {
        const repositoryUrl = item.repository_url.split('/')
        const repo = repositoryUrl.pop()
        const owner = repositoryUrl.pop()
        const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)
        let reviewers: any[] = []
        let newItem

        try {
            if (repo && owner && pullNumber && item.pull_request?.url ) {
                const hasLocalStorage = prStorage.get(item.id) !== null
                const info = await getPullRequest({
                    owner,
                    repo,
                    pull_number: pullNumber
                }, hasLocalStorage)
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
                    ...info,
                    repo,
                    owner,
                    branches: {
                        head: info.head.ref,
                        base: info.base.ref
                    },
                    reviewers,
                    user: userInfo
                }
            }

            newItem = {
                ...newItem,
                owner,
                repo,
                pullNumber
            }

            prStorage.store(item.id, newItem)
        } catch (error: any) {
            if(error.status === 304) {
                return prStorage.get(item.id)
            }
        }

        return newItem
    }))

    sessionStorage.setItem('lastSearched', new Date().toISOString())

    return {
        tickets: groupPeerReviews(results),
        totalCount: total_count
    }
}

const groupPeerReviews = (prs: any[]) => {
    const groupedPRs: any[] = []

    prs?.forEach((pr: any) => {
        const ticket  = pr.branches?.head.split('/').pop() ?? ''
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