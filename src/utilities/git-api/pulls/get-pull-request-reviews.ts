import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth'

export const getPullRequestReviews = async (owner: string, repo: string, pullNumber: number) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    const { data } = await octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber
    })

    const filteredReviews: typeof data = []

    data.forEach(review => {
        const index = filteredReviews.findIndex(r => r.user?.login === review.user?.login)

        if(index === -1) {
            filteredReviews.push(review)
        } else {
            filteredReviews[index] = review
        }
    })

    return filteredReviews
}