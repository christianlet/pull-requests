import { Factory } from '@christianlet/github-api-client'
import { githubApiConfig } from '../github-api-config'
import { RestEndpointMethodTypes } from '@octokit/rest'

export const getPullRequest = async (args: RestEndpointMethodTypes["pulls"]["get"]["parameters"], hasLocalStorage = false) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

    const lastSearched = sessionStorage.getItem('lastSearched')

    const { data } = await octokit.pulls.get({
        ...args,
        headers:
            lastSearched && hasLocalStorage
            ? { "If-Modified-Since": lastSearched }
            : {}
    })

    return data
}