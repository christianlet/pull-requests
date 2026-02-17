import { Factory } from '@christianlet/github-api-client'
import { Octokit } from '@octokit/rest'
import { githubApiConfig } from './git-api/github-api-config'


export class OctokitClient {
    protected static instance: Octokit

    public static async getInstance(): Promise<Octokit> {
        if(!this.instance) {
            const factory = new Factory()

            this.instance = await factory.generate(githubApiConfig)
        }

        return this.instance
    }
}
