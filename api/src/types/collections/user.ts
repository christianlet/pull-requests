import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { LastModifiedDate } from '../last-modified-date'

export type User =
    RestEndpointMethodTypes['users']['getByUsername']['response']['data']
    & LastModifiedDate