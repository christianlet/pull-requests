import { Factory } from '@christianlet/github-api-client'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { githubApiConfig } from '../github-api-config'

export const getCommit = async (arg: RestEndpointMethodTypes["pulls"]["listCommits"]["parameters"]) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

    const { data } = await octokit.pulls.listCommits(arg)

    return data
}
