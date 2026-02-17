
import { OctokitClient } from '../../octokit-client'

export const getTags = async (owner: string, repo: string, ref: string) => {
    const octokit = await OctokitClient.getInstance()
    let { data: latest } = await octokit.repos.getLatestRelease({
        owner,
        repo
    }).catch(() => ({ data: undefined }))

    const { data: releases } = await octokit.repos.listReleases({
        owner,
        repo
    })

    let current

    for (const release of releases) {
        if(release.target_commitish === ref) {
            current = release
        }
    }

    if(!latest && releases.length > 0) {
        latest = releases.at(releases.length - 1)
    }

    return {
        latest,
        current
    }
}