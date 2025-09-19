import { PullRequestFull } from '../types/api-types'
import { Release } from '../types/releases/release'
import { Api } from './git-api/storage/api'
import { jiraTicket } from './jira-ticket'

export const groupPullRequests = (prs: PullRequestFull[]) => {
    const releaseStorage = new Api<Release>('releases')
    const groupedPRs: any[] = []

    prs?.forEach(pr => {
        const ticket  = pr.head.ref.split('/').pop() ?? ''
        const [,team, version] = pr.head.ref.match(/^collab\/(.*)\/release\/(.*)$/) || []
        let release = null

        if(team && version) {
            release = releaseStorage.get(`${team}-${version}`)
        }

        const link = jiraTicket(ticket)
        const prIndex = groupedPRs.findIndex(repo => repo.info.branch === pr.head.ref)

        if(prIndex === -1) {
            groupedPRs.push({
                info: {
                    branch: pr.head.ref,
                    release,
                    link
                },
                repos: [pr]
            })
        } else {
            groupedPRs[prIndex].repos.push(pr)
        }
    })

    return groupedPRs
}
