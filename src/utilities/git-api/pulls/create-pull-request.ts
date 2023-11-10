import { Factory } from '../../authorizations/factory'
import { getBranch } from '../branches/get-branch'

export const createPullRequest = async (owner: string, repo: string, branch: string, title: string, description: string) => {
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

    const response = await octokit.pulls.create({
        owner,
        repo,
        head: branch,
        base,
        title,
        body: description,
        maintainer_can_modify: true
    })

    return response.status === 201
}