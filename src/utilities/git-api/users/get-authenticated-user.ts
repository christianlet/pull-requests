import { Factory } from '../../authorizations/factory'

export const getAuthenticatedUser = async () => {
    const factory = new Factory()
    const octokit = await factory.generate()

    const { data } = await octokit.users.getAuthenticated()

    return data
}