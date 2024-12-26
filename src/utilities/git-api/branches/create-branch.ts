
import { getRepository } from '../repository/get-repository'
import { OctokitClient } from '../../octokit-client'

export const createBranch = async (owner: string, repo: string, branch: string) => {

    const octokit = await OctokitClient.getInstance()
    const repoInfo = await getRepository(owner, repo)
    const baseBranch = await octokit.repos.getBranch({ owner, repo, branch: repoInfo.data.default_branch })

    const response = await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: baseBranch.data.commit.sha
    })

    return response.status === 201
}