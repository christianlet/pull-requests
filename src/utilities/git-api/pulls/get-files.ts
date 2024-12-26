
import { OctokitClient } from '../../octokit-client'

export const getFiles = async (owner: string, repo: string, number: number) => {
    const octokit = await OctokitClient.getInstance()
    const { data } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: number
    })

    return data
}