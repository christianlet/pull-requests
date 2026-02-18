import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { User } from './collections/user'

export type Reviewer =
    RestEndpointMethodTypes['pulls']['listReviews']['response']['data'][0]
    & {
        user: User
    }