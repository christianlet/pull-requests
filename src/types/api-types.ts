import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { Release } from './releases/release'

export type PullRequest = RestEndpointMethodTypes["pulls"]["get"]["response"]["data"]

export type PullRequestFull =
    RestEndpointMethodTypes["pulls"]["get"]["response"]["data"]
    & {
        reviewers: Reviewer[]
        lastModifiedSince?: string
        hasPackages?: boolean
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
        release: null | Release
        link: null | string
    }
    repos: PullRequestFull[]
}