import { Factory } from '@christianlet/github-api-client'

export const getRepository = async (
    owner: string,
    repo: string
) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    return octokit.repos.get({
        owner,
        repo
    })
}