import { store } from '../../../store';
import { Factory } from '../../authorizations/factory';

export const getFiles = async (owner: string, repo: string, number: number) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    const { data } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: number
    })

    return data
}