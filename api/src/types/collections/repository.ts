import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { LastModifiedDate } from '../last-modified-date'

export type Repository =
    RestEndpointMethodTypes['repos']['get']['response']['data']
    & LastModifiedDate