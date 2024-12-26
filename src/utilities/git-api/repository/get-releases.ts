
import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

export const getRelease = async (tag: string, arg: RestEndpointMethodTypes["repos"]["listReleases"]["parameters"]) => {
    const octokit = await OctokitClient.getInstance()
    const { data } = await octokit.repos.listReleases(arg)
    let releaseInfo = null

    for (const release of data) {
        if(release.tag_name.includes(tag)) {
            releaseInfo = release
        }
    }

    return releaseInfo
}