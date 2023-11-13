import { Factory } from '@christianlet/github-api-client';
import { getRepository } from '../repository/get-repository'

export const createBranch = async (owner: string, repo: string, branch: string) => {
    const factory = new Factory()
    const octokit = await factory.generate()
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