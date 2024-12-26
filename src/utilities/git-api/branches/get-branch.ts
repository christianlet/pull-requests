import { OctokitClient } from '../../octokit-client'


export const getBranch = async (owner: string, repo: string, branch: string) => {

    const octokit = await OctokitClient.getInstance()

    let exists = false

    await octokit.repos.getBranch({
        owner,
        repo,
        branch,
    })
    .then(results => {
        exists = results.data.name === branch
    })
    .catch(e => {})

    return exists
}