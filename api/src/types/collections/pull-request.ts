import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { LastModifiedDate } from '../last-modified-date'
import { Reviewer } from '../reviewer'

export type PullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data']

export type PullRequestFull =
    RestEndpointMethodTypes['pulls']['get']['response']['data']
    & LastModifiedDate
    & {
        reviewers: Reviewer[]
    }