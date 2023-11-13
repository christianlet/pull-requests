import { Factory } from '@christianlet/github-api-client'
import { getRepository } from '../repository/get-repository'

export const createPullRequest = async (owner: string, repo: string, branch: string, title: string, description: string) => {
    const factory = new Factory()
    const octokit = await factory.generate()
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