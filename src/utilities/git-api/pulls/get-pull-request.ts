
import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

export const getPullRequest = async (args: RestEndpointMethodTypes["pulls"]["get"]["parameters"], hasLocalStorage = false) => {
    const octokit = await OctokitClient.getInstance()
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