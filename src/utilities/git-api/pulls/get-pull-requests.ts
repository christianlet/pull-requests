import { TicketsState } from '../../../types/api-types'
import { getPR, storePR } from '../../local-storage'
import { getOpenPullRequests } from '../search/get-open-pull-requests'
import { getUserInfo } from '../users/get-user-info'
import { getPullRequest } from './get-pull-request'
import { getPullRequestReviews } from './get-pull-request-reviews'

interface PullRequestWithPagination {
    tickets: TicketsState[],
    totalCount: number
}

export const getPullRequests = async (author: string, reviewing: boolean, page: number): Promise<PullRequestWithPagination> => {
    const { total_count, items: openPullRequests } = await getOpenPullRequests(reviewing, author, page)
        .catch(e => ({
            total_count: 0,
            items: []
        }))

    const results: any = await Promise.all(openPullRequests.map(async (item) => {
        const repositoryUrl = item.repository_url.split('/')
        const repo = repositoryUrl.pop()
        const owner = repositoryUrl.pop()
        const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)
        const userInfo = await getUserInfo(item.user?.login ?? '')
        let reviewers: any[] = []
        let newItem: any = item


        try {
            if (repo && owner && pullNumber && item.pull_request?.url ) {
                const hasLocalStorage = getPR(item.id) !== null
                const info = await getPullRequest(owner, repo, pullNumber, hasLocalStorage)
                const reviews = await getPullRequestReviews(owner, repo, pullNumber)

                reviewers = await Promise.all(reviews
                    .filter(r => r.state === 'APPROVED' || r.state === 'CHANGES_REQUESTED')
                    .map(async r => {
                        const user = await getUserInfo(r.user?.login ?? '')

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

            storePR(item.id, newItem)
        } catch (error: any) {
            if(error.status === 304) {
                return await getPR(item.id)
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
        const ticket  = pr.branches.head.split('/').pop() ?? ''
        const prIndex = groupedPRs.findIndex(repo => repo.ticket === ticket)

        if(prIndex === -1) {
            groupedPRs.push({
                ticket,
                repos: [pr]
            })
        } else {
            groupedPRs[prIndex].repos.push(pr)
        }

    })

    return groupedPRs
}