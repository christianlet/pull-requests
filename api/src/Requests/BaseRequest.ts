import { Octokit } from '@octokit/rest'
import { PersonalAccessToken } from '../Authorizers/PersonalAccessToken'


export abstract class BaseRequest {
    protected api: Octokit

    public constructor() {
        const authorizer = new PersonalAccessToken()

        this.api = authorizer.connect()
    }
}
