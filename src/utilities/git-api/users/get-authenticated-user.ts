import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth';

export const getAuthenticatedUser = async () => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    const { data } = await octokit.users.getAuthenticated()

    return data
}