
import { OctokitClient } from '../../octokit-client'
import { getRepository } from '../repositories/get-repository'

export const createPullRequest = async (owner: string, repo: string, branch: string, title: string, description: string) => {

    const octokit = await OctokitClient.getInstance()
    const repoInfo = await getRepository(owner, repo)

    const response = await octokit.pulls.create({
        owner,
        repo,
        head: branch,
        base: repoInfo.data.default_branch,
        title,
        body: description,
        maintainer_can_modify: true
    })

    return response.status === 201
}