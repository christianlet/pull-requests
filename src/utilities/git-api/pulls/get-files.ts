import { Factory } from '@christianlet/github-api-client';
import { githubApiConfig } from '../github-api-config'

export const getFiles = async (owner: string, repo: string, number: number) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

    const { data } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: number
    })

    return data
}