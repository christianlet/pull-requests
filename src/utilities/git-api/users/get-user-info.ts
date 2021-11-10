import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth';

export const getUserInfo = async (login: string) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    const { data } = await octokit.users.getByUsername({
        username: login
    })

    return data
}