
import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'
import { getRepository } from '../repositories/get-repository'
import { getBranch } from './get-branch'

type GitRef = RestEndpointMethodTypes["git"]["getRef"]["response"]['data'] | RestEndpointMethodTypes["git"]["createRef"]["response"]['data']

export const createBranch = async (owner: string, repo: string, branch: string) => {
    const octokit = await OctokitClient.getInstance()
    const repoInfo = await getRepository(owner, repo)
    let requestedBranch = await getBranch(owner, repo, branch)

    if(!requestedBranch) {
        const baseBranch = await octokit.repos.getBranch({ owner, repo, branch: repoInfo.data.default_branch })
        const ref = await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha: baseBranch.data.commit.sha
        })

        requestedBranch = ref.data
    }

    return requestedBranch
}