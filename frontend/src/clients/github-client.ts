import { RestEndpointMethodTypes } from '@octokit/rest'
import { PullRequestFull, User } from '../types/api-types'

interface ApiRequestInit extends RequestInit {
    searchParams?: Record<string, unknown>
}

interface PullRequestWithPagination {
    items: PullRequestFull[],
    totalCount: number
}

type Arguments = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["parameters"] & {
    hardFetch?: boolean
}

export class GitHubClient {
    private static instance: GitHubClient

    public static getInstance(): GitHubClient {
        if (!this.instance) {
            this.instance = new GitHubClient()
        }

        return this.instance
    }

    private baseUrl: string
    private requiredHeaders: HeadersInit

    private constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL
        this.requiredHeaders = {
            'Content-Type': 'application/json',
            'Authorization': import.meta.env.VITE_PAT
        }
    }

    public async getUsers(params?: { q?: string; size?: number }) {
        const response = await this.request<{ items: User[] }>('/github/users', {
            searchParams: params
        })
        const users = response.items.map(item => ({
            ...item,
            username: item.login,
            name: item.name || item.login
        }))

        return users
    }

    public async getPullRequests(args: Arguments): Promise<PullRequestWithPagination> {
        const response = await this.request<PullRequestWithPagination>('/github/search/pull-requests', {
            searchParams: args
        })

        return response
    }

    private async request<Type>(endpoint: string, requestInit?: ApiRequestInit): Promise<Type> {
        const url = new URL(this.baseUrl)

        url.pathname = endpoint

        if (requestInit?.searchParams) {
            for (let [key, value] of Object.entries(requestInit.searchParams)) {
                if (typeof value === 'number') {
                    value = value.toString()
                }

                if (typeof value !== 'string') {
                    continue
                }

                url.searchParams.set(key, value)
            }
        }

        const response = await fetch(url, {
            ...requestInit,
            headers: {
                ...requestInit?.headers,
                ...this.requiredHeaders
            }
        })

        return response.json()
    }
}
