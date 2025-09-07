import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

export const createCommit = async (
    owner: string,
    repo: string,
    branch: RestEndpointMethodTypes['git']['getRef']['response']['data'],
    blobs: RestEndpointMethodTypes['git']['createTree']['parameters']['tree'],
    message: string
) => {
        const octo = await OctokitClient.getInstance()
        const commit = await octo.git.getCommit({
            owner,
            repo,
            commit_sha: branch.object.sha
        })

        const tree = await octo.git.createTree({
            owner,
            repo,
            base_tree: commit.data.tree.sha,
            tree: blobs
        })

        const newCommit = await octo.git.createCommit({
            owner,
            repo,
            message,
            tree: tree.data.sha,
            parents: [branch.object.sha]
        })

        return octo.rest.git.updateRef({
            owner,
            repo,
            ref: branch.ref.replace('refs/', ''),
            sha: newCommit.data.sha
        })
}