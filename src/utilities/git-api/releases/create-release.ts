import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

export const createRelease = async (
    owner: string,
    repo: string,
    branch: string,
    tagName: string,
    existingRelease?: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]["data"]
) => {
    const octo = await OctokitClient.getInstance()
    let response

    if(existingRelease) {
        response = await octo.repos.updateRelease({
            owner,
            repo,
            name: tagName,
            tag_name: tagName,
            release_id: existingRelease.id,
            target_commitish: branch,
            prerelease: true
        })
    } else {
        response = await octo.repos.createRelease({
            owner,
            repo,
            name: tagName,
            tag_name: tagName,
            target_commitish: branch,
            prerelease: true
        })
    }

    return response
}