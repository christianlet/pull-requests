import { Octokit } from '@octokit/rest'
import { Authorization } from './auth';

export class PersonalAccessToken implements Authorization {
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
