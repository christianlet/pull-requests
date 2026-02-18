import { Octokit } from '@octokit/rest'


export class OctokitClient {
    protected static instance: Octokit

    public static async getInstance(token: string): Promise<Octokit> {
        if (!this.instance) {
            this.instance = new Octokit({
                auth: token
            })
        }

        return this.instance
    }
}
