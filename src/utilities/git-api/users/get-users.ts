
import { getAuthenticatedUser } from './get-authenticated-user'
import { getUserInfo } from './get-user-info'
import { SessionStorage } from '../storage/session-storage'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

type GhUser = RestEndpointMethodTypes["users"]["getByUsername"]["response"]['data']

export const getUsers = async () => {
    const octokit = await OctokitClient.getInstance()
    const authenticatedUser = await getAuthenticatedUser()
    const userStorage = new SessionStorage<GhUser>('githubUsers')
    const lastSearched = sessionStorage.getItem('lastSearched')
    const { data } = await octokit.request('GET /user/teams')
    let members: string[] = []
    let users = []

    for(let team of data) {
        const { data } = await octokit.request('GET /orgs/{org}/teams/{team_slug}/members', {
            org: team.organization.login,
            team_slug: team.slug,
            headers:
                lastSearched
                ? { "If-Modified-Since": lastSearched }
                : {}
        })

        for(let member of data) {
            if(!members.includes(member.login)) {
                members.push(member.login)

                let user

                if(!userStorage.get(member.login)) {
                    if(member.login === authenticatedUser.login) {
                        user = authenticatedUser
                    } else {
                        user = await getUserInfo(member.login)
                    }

                    userStorage.store(user.login, user)
                } else {
                    user = userStorage.get(member.login)!
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