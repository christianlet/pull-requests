import { store } from '../../../store'
import { Factory } from '../../authorizations/factory';

export const getBranch = async (owner: string, repo: string, branch: string) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    let exists = false

    await octokit.repos.getBranch({
        owner,
        repo,
        branch
    })
    .then(results => exists = results.status === 200)
    .catch(e => {})

    return exists
}