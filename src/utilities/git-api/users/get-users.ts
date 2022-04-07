import { Factory } from '../../authorizations/factory'
import { getAuthenticatedUser } from './get-authenticated-user'
import { getUserInfo } from './get-user-info'

export const getUsers = async () => {
    const factory = new Factory()
    const octokit = await factory.generate()

    const authenticatedUser = await getAuthenticatedUser()
    const { data } = await octokit.request('GET /user/teams')
    let members: string[] = []
    let users: any[] = []

    for(let team of data) {
        const { data } = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
            org: team.organization.login,
            team_slug: team.slug
        })

        for(let member of data) {
            if(!members.includes(member.login)) {
                members.push(member.login)

                let user

                if(member.login === authenticatedUser.login) {
                    user = {
                        ...authenticatedUser,
                        login: '@me'
                    }
                } else {
                    user = await getUserInfo(member.login)
                }

                users.push({
                    username: user.login,
                    name: user?.name ?? member.login
                })
            }
        }
    }

    return users.sort(
        (a, b) => (a.name.toLowerCase() > b.name.toLowerCase())
            ? 1
            : (
                (b.name.toLowerCase() > a.name.toLowerCase())
                    ? -1
                    : 0
            )
    )
}