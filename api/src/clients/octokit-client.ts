import { Octokit } from '@octokit/rest'


export class OctokitClient {
    protected static instance: Octokit

    public static getInstance(token?: string): Octokit {
        if (!token) {
            throw new Error('Missing auth token')
        } else if (!this.instance) {
            this.instance = new Octokit({
                auth: token
            })
        }

        return this.instance
    }
}
