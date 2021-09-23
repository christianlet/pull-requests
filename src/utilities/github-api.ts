import { useEffect, useState } from 'react'
import { Octokit } from '@octokit/rest'
import { PersonalAccessToken } from './authorizations/personal-access-token'
import { getPR, storePR } from './local-storage'

export interface PullRequest {
    id: number
    pull_request: {
        html_url: string
    }
    branches: {
        head: string
        base: string
    }
    merged: boolean
    mergeable: boolean
    reviewers: {
        id: number
        login: string
        name?: string
        state: string
        avatar_url: string
    }[]
    repo: string
    user: {
        [index: string]: any
    }
}

export const usePullRequestsHook = (reviewing: boolean) => {
    const octokit = new PersonalAccessToken().generate()
    const [pullRequests, setPullRequests] = useState<null|PullRequest[]>(null)

    useEffect(() => {
        setPullRequests(null)

        const getPRs = async () => {
            const openPullRequests = await searchOpenPullRequests(octokit, reviewing)

            const results: any = await Promise.all(openPullRequests.map(async (item) => {
                const repositoryUrl = item.repository_url.split('/')
                const repo = repositoryUrl.pop()
                const owner = repositoryUrl.pop()
                const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)
                let reviewers: any[] = []
                let newItem: any = item

                try {
                    if (repo && owner && pullNumber && item.pull_request?.url ) {
                        const hasLocalStorage = getPR(item.id) !== null
                        const info = await fetchPullRequestInfo(octokit, owner, repo, pullNumber, hasLocalStorage)

                        const reviews = await fetchPullRequestReviews(octokit, owner, repo, pullNumber)

                        reviewers = await Promise.all(reviews
                            .filter(r => r.state === 'APPROVED' || r.state === 'CHANGES_REQUESTED')
                            .map(async r => {
                                const user = await fetchUserInfo(octokit!, r.user?.login ?? '')

                                return {
                                    ...user,
                                    state: r.state
                                }
                            }))

                        newItem = {
                            ...newItem,
                            branches: {
                                head: info.head.ref,
                                base: info.base.ref
                            },
                            merged: info.merged,
                            mergeable: info.mergeable_state === 'clean',
                            reviewers
                        }
                    }

                    newItem = {
                        ...newItem,
                        repo,
                    }

                    storePR(item.id, newItem)
                } catch (error: any) {
                    if(error.status === 304) {
                        return await getPR(item.id)
                    }
                }

                return newItem
            }))

            setPullRequests(results)

            localStorage.setItem('lastSearched', new Date().toUTCString())
        }

        getPRs()
    }, [reviewing])


    return pullRequests
}

const searchOpenPullRequests = async (octokit: Octokit, reviewing: boolean) => {
    let query = '+author:@me'

    if(reviewing) {
        const { data } = await octokit.request('GET /user/teams')

        query = ''

        data.forEach(team => {
            query += `+team:${team.organization.login}/${team.slug}`
        })
    }

    const { data } = await octokit.search.issuesAndPullRequests({
        q: `is:pr${query}+is:open`,
        sort: 'created',
        per_page: 50
    })

    return data.items
}

const fetchPullRequestInfo = async (octokit: Octokit, owner: string, repo: string, pullNumber: number, hasLocalStorage: boolean) => {
    const lastSearched = localStorage.getItem('lastSearched')

    const { data } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        headers:
            lastSearched && hasLocalStorage
            ? { "If-Modified-Since": new Date(lastSearched).toUTCString() }
            : {}
    })

    return data
}

const fetchPullRequestReviews = async (octokit: Octokit, owner: string, repo: string, pullNumber: number) => {
    const { data } = await octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber
    })

    const filteredReviews: typeof data = []

    data.forEach(review => {
        if(!filteredReviews.filter(filteredReview => filteredReview.user?.login === review.user?.login).length) {
            filteredReviews.push(review)
        }
    })

    return filteredReviews
}

const fetchUserInfo = async (octokit: Octokit, login: string) => {
    const { data } = await octokit.users.getByUsername({
        username: login
    })

    return data
}

export const useRateLimitHook = (refresh: number = 0) => {
    const octokit = new PersonalAccessToken().generate()
    const [data, setData] = useState<null|{[index: string]: any}>(null)

    useEffect(() => {
        const getRateLimit = async () => {
            const { data } = await octokit.rateLimit.get()

            setData(data.resources)
        }

        getRateLimit()
    }, [refresh])

    return data
}

export const closePullRequest = async (owner: string, repo: string, pullNumber: number) => {
    const octokit = new PersonalAccessToken().generate()

    const response = await octokit.pulls.update({
        owner,
        repo,
        pull_number: pullNumber,
        state: 'closed'
    })

    return response.status === 200
}