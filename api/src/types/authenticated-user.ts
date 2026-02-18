import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'

export type AuthenticatedUser = RestEndpointMethodTypes['users']['getAuthenticated']['response']['data']