import { useEffect, useState } from 'react'
import { Octokit } from '@octokit/rest'
import { PersonalAccessToken } from './authorizations/personal-access-token'
import { getLocalPRs, getPR, storePR } from './local-storage'

export const usePullRequestsHook = () => {
    const octokit = new PersonalAccessToken().generate()
    const [pullRequests, setPullRequests] = useState<any[]>([])

    useEffect(() => {
        const getPRs = async () => {
            const openPullRequests = await searchOpenPullRequests(octokit)

            const results = await Promise.all(openPullRequests.map(async (item) => {
                const repositoryUrl = item.repository_url.split('/')
                const repo = repositoryUrl.pop()
                const owner = repositoryUrl.pop()
                const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)
                let reviewers: any[] = []
                let branches = {}
                let merged = false
                let newItem: any = item

                try {
                    if (repo && owner && pullNumber && item.pull_request?.url ) {
                        const hasLocalStorage = ((await getLocalPRs())?.length ?? 0) > 0
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
                            mergeable: info.mergeable_state !== 'blocked',
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
    }, [])


    return pullRequests
}

const searchOpenPullRequests = async (octokit: Octokit) => {
    const { data } = await octokit.search.issuesAndPullRequests({
        'q': 'is:pr+author:@me+is:open'
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

    return data
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
