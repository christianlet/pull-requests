import { useEffect, useState } from 'react'
import { Octokit } from '@octokit/rest'
import { PersonalAccessToken } from './authorizations/personal-access-token'
import { getPR, storePR } from './local-storage'
import { TicketsState, User } from '../types/api-types'

const octokit = new PersonalAccessToken().generate()
const usersInfo: User[] = []


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
        const userInfo = await getUserInfo(item.user?.login)
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
                        const user = await getUserInfo(r.user?.login)

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


export const useAuthorsHook = () => {
    const [authors, setAuthors] = useState<null|{ username: string, name?: string }[]>([])

    useEffect(() => {
        setAuthors(null)

        const fetch = async () => {
            const users = await getUsers()

            setAuthors(users)
        }

        fetch()
    }, [])


    return authors
}

export const getAuthenticatedUser = async () => {
    const { data } = await octokit.users.getAuthenticated()

    return data
}

export const getUsers = async () => {
    const authenticatedUser = await getAuthenticatedUser()
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

    return users.sort(
        (a, b) => (a.name.toLowerCase() > b.name.toLowerCase())
            ? 1
            : (
                (b.name.toLowerCase() > a.name.toLowerCase())
                    ? -1
                    : 0
            )
    )
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

export const requestDevBranch = async (owner: string, repo: string, pullNumber: number) => {
    const octokit = new PersonalAccessToken().generate()

    const response = await octokit.pulls.requestReviewers({
        owner,
        repo,
        pull_number: pullNumber,
        reviewers: [
            'ashleymendez'
        ]
    })

    return response.status === 201
        ? response.data.requested_reviewers
        : false
}

const getUserInfo = async (user?: string) => {
    let userInfo = usersInfo.filter(u => u.login === user).pop()

    if(!userInfo) {
        userInfo = await fetchUserInfo(user ?? '')
    }

    return userInfo
}