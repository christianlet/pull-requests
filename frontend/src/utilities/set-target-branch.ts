import { PullRequestFull } from '../types/api-types'
import { OctokitClient } from './octokit-client'

export const setTargetBranch = async (branch: PullRequestFull, targetBranch: string) => {
    const octokit = await OctokitClient.getInstance()

    const baseBranch = await octokit.repos.getBranch({
        owner: branch.base.repo.owner.login,
        repo: branch.base.repo.name,
        branch: targetBranch
    }).catch(() => null)

    if(!baseBranch) {
        const defaultBranch = await octokit.repos.getBranch({
            owner: branch.base.repo.owner.login,
            repo: branch.base.repo.name,
            branch: branch.base.repo.default_branch
        })

        await octokit.git.createRef({
            owner: branch.base.repo.owner.login,
            repo: branch.base.repo.name,
            ref: `refs/heads/${targetBranch}`,
            sha: defaultBranch.data.commit.sha
        })
    }

   return octokit.pulls.update({
        owner: branch.base.repo.owner.login,
        repo: branch.base.repo.name,
        pull_number: branch.number,
        base: targetBranch
    })
}