import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';

export type PullRequest =
    RestEndpointMethodTypes["pulls"]["get"]["response"]["data"]
    & {
        repo: string
        owner: string
        user: User
        reviewers: Reviewer[]
        branches: {
            base: string
            head: string
        }
    }

export type User =
    RestEndpointMethodTypes["users"]["getByUsername"]["response"]["data"]

export type AuthenticatedUser =
    RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]["data"]

export type Reviewer =
    RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"][0]
    & {
        user: User
    }

export interface TicketsState {
    info: {
        number: string
        link: null | string
    }
    repos: PullRequest[]
}