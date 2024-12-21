import { Factory } from '@christianlet/github-api-client'
import { githubApiConfig } from '../github-api-config'
import { RestEndpointMethodTypes } from '@octokit/rest'

export const getRelease = async (tag: string, arg: RestEndpointMethodTypes["repos"]["listReleases"]["parameters"]) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)
    const { data } = await octokit.repos.listReleases(arg)
    let releaseInfo = null

    for (const release of data) {
        if(release.tag_name.includes(tag)) {
            releaseInfo = release
        }
    }

    return releaseInfo
}