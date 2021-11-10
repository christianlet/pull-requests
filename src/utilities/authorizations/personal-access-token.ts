import { Octokit } from '@octokit/rest'
import { AuthorizationConstructor } from './authorization-interface';

export class PersonalAccessToken implements AuthorizationConstructor {
    protected accessToken: string

    constructor() {
        const token = process.env?.REACT_APP_PAT

        if(token) {
            this.accessToken = token
        } else {
            throw new Error("Missing token");
        }
    }
    /**
     * generate
     */
    public async generate() {
        return new Octokit({
            auth: this.accessToken
        })
    }
}
