import { Factory } from '../../authorizations/factory';
import { getBranch } from './get-branch'

export const createBranch = async (owner: string, repo: string, branch: string) => {
    const factory = new Factory()
    const octokit = await factory.generate()
    const masterExists = await getBranch(owner, repo, 'master')
    const mainExists = await getBranch(owner, repo, 'main')
    let base = 'master'

    if (!masterExists && mainExists) {
        base = 'main'
    } else if (!masterExists && !mainExists) {
        console.log('Branch `main` or `master` was not found')

        return false
    }

    const baseBranch = await octokit.repos.getBranch({ owner, repo, branch: base })

    if (!baseBranch) {
        return false
    }

    const res = await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: baseBranch.data.commit.sha
    })

    return res.status === 201
}