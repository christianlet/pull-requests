import { useEffect, useState } from 'react'
import { Octokit } from '@octokit/rest'
import { PersonalAccessToken } from './authorizations/personal-access-token'
import { getPR, storePR } from './local-storage'
import { TicketsState } from '../tickets'

export interface PullRequest {
    id: number
    pull_request: {
        html_url: string
        diff_url: string
    }
    branches: {
        head: string
        base: string
    }
    merged: boolean
    mergeable: boolean
    reviewers: {
        id: number
        state: string
        avatar_url: string
        submitted_at: string
        user: {
            name?: string
            login: string
        }
    }[]
    owner: string
    repo: string
    number: number
    state: string
    created_at: string
    user: {
        [index: string]: any
    }
}

const octokit = new PersonalAccessToken().generate()

interface PullRequestWithPagination {
    tickets: TicketsState[],
    totalCount: number
}

export const getPullRequests = async (author: string, reviewing: boolean, page: number): Promise<PullRequestWithPagination> => {
    const { total_count, items: openPullRequests } = await searchOpenPullRequests(octokit, reviewing, author, page)
        .catch(e => ({
            total_count: 0,
            items: []
        }))

    const results: any = await Promise.all(openPullRequests.map(async (item) => {
        const repositoryUrl = item.repository_url.split('/')
        const repo = repositoryUrl.pop()
        const owner = repositoryUrl.pop()
        const pullNumber = parseInt(item.pull_request?.url?.split('/').pop() ?? '0', 10)
        let reviewers: any[] = []
        let newItem: any = item

        newItem.user = await fetchUserInfo(item.user?.login ?? '')

        try {
            if (repo && owner && pullNumber && item.pull_request?.url ) {
                const hasLocalStorage = getPR(item.id) !== null
                const info = await fetchPullRequestInfo(octokit, owner, repo, pullNumber, hasLocalStorage)
                const reviews = await fetchPullRequestReviews(octokit, owner, repo, pullNumber)

                reviewers = await Promise.all(reviews
                    .filter(r => r.state === 'APPROVED' || r.state === 'CHANGES_REQUESTED')
                    .map(async r => {
                        const user = await fetchUserInfo(r.user?.login ?? '')

                        return {
                            ...r,
                            id: user.id,
                            name: user.name,
                            avatar_url: user.avatar_url
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


export const useAuthorsHook = () => {
    const [authors, setAuthors] = useState<null|{ username: string, name?: string }[]>([])

    useEffect(() => {
        setAuthors(null)

        const getUsers = async () => {
            const { data: authenticatedUser } = await octokit.users.getAuthenticated()
            const { data } = await octokit.request('GET /user/teams')
            let members: string[] = []
            let users: any[] = []

            for(let team of data) {
                const { data } = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
                    org: team.organization.login,
                    team_slug: team.slug
                })

                for(let member of data) {
                    if(!members.includes(member.login)) {
                        members.push(member.login)

                        let user

                        if(member.login === authenticatedUser.login) {
                            user = {
                                ...authenticatedUser,
                                login: '@me'
                            }
                        } else {
                            user = await fetchUserInfo(member.login)

                        }

                        users.push({
                            username: user.login,
                            name: user?.name ?? member.login
                        })
                    }
                }
            }

            setAuthors(
                users.sort(
                    (a, b) => (a.name.toLowerCase() > b.name.toLowerCase())
                        ? 1
                        : (
                            (b.name.toLowerCase() > a.name.toLowerCase())
                                ? -1
                                : 0)
                        )
            )
        }

        getUsers()
    }, [])


    return authors
}

const searchOpenPullRequests = async (octokit: Octokit, reviewing: boolean, author: string, page: number) => {
    let query = `author:${author}`

    if(reviewing) {
        query = 'review-requested:@me'

        if(author !== '') {
            query += `+author:${author}`
        }
    }

    const { data } = await octokit.search.issuesAndPullRequests({
        q: `${query}+is:pr+is:open`,
        sort: 'created',
        per_page: 50,
        page,
    })

    return data
}

const fetchPullRequestInfo = async (octokit: Octokit, owner: string, repo: string, pullNumber: number, hasLocalStorage: boolean) => {
    const lastSearched = sessionStorage.getItem('lastSearched')

    const { data } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        headers:
            lastSearched && hasLocalStorage
            ? { "If-Modified-Since": lastSearched }
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
        const index = filteredReviews.findIndex(r => r.user?.login === review.user?.login)

        if(index === -1) {
            filteredReviews.push(review)
        } else {
            filteredReviews[index] = review
        }
    })

    return filteredReviews
}

const fetchUserInfo = async (login: string) => {
    const { data } = await octokit.users.getByUsername({
        username: login
    })

    return data
}

export const fetchBranch = async (owner: string, repo: string, branch: string) => {
    let exists = false

    await octokit.repos.getBranch({
        owner,
        repo,
        branch
    })
    .then(results => exists = results.status === 200)
    .catch(e => {})

    return exists
}

export const createBranch = async (owner: string, repo: string, branch: string) => {
    let response

    try {
        response = await octokit.repos.getBranch({ owner, repo, branch: 'master' })
    } catch (error) {
        console.log('Master branch does not exist')
    }

    if(!response) {
        try {
            response = await octokit.repos.getBranch({ owner, repo, branch: 'main' })
        } catch (error) {
            console.log('Main branch does not exist')
            return false
        }
    }

    const res = await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: response.data.commit.sha
    })

    return res.status === 201
}

export const useRateLimitHook = (refresh: number = 0) => {
    const octokit = new PersonalAccessToken().generate()
    const [data, setData] = useState<{
        core: {
            limit: number
            remaining: number
            reset: number
            used: number
        }
        search: {
            limit: number;
            remaining: number;
            reset: number;
            used: number;
        }
    }>({
        core: {
            limit: 0,
            remaining: 0,
            reset: 0,
            used: 0,
        },
        search: {
            limit: 0,
            remaining: 0,
            reset: 0,
            used: 0,
        }
    })

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
    const response = await updatePullRequest(owner, repo, pullNumber, {
        state: 'closed'
    })

    return response
}

export const updatePullRequest = async (owner: string, repo: string, pullNumber: number, params: Object) => {
    const octokit = new PersonalAccessToken().generate()

    const response = await octokit.pulls.update({
        owner,
        repo,
        pull_number: pullNumber,
        ...params,
        maintainer_can_modify: false
    })

    return response.status === 200
}

export const mergePullRequest = async (owner: string, repo: string, pullNumber: number, params?: Object) => {
    const octokit = new PersonalAccessToken().generate()

    const response = await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pullNumber,
        ...params,
        maintainer_can_modify: true
    })

    return response.data.merged
}