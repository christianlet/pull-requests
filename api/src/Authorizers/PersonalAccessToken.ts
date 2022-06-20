import { Octokit } from '@octokit/rest'
import { Authorizer } from './Authorizer'

export class PersonalAccessToken extends Authorizer {
    public connect() {
        const token = process.env?.PERSONAL_ACCESS_TOKEN

        if(!token) {
            throw new Error("Missing token");
        }

        return new Octokit({
            auth: token
        })
    }
}
