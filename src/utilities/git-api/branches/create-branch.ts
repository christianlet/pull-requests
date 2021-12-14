import { store } from '../../../store'
import { Factory } from '../../authorizations/factory';

export const createBranch = async (owner: string, repo: string, branch: string) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    let response

    try {
        response = await octokit.repos.getBranch({ owner, repo, branch: 'master' })
    } catch (error) {
        console.log('Master branch does not exist')
    }

    if(!response) {
        try {
            response = await octokit.repos.getBranch({ owner, repo, branch: 'main' })
        } catch (error) {
            console.log('Main branch does not exist')
            return false
        }
    }

    const res = await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: response.data.commit.sha
    })

    return res.status === 201
}