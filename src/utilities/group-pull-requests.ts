import { PullRequestFull } from '../types/api-types'
import { jiraTicket } from './jira-ticket'

export const groupPullRequests = (prs: PullRequestFull[]) => {
    const groupedPRs: any[] = []

    prs?.forEach(pr => {
        const ticket  = pr.head.ref.split('/').pop() ?? ''
        const link = jiraTicket(ticket)
        const prIndex = groupedPRs.findIndex(repo => repo.info.number === ticket)

        if(prIndex === -1) {
            groupedPRs.push({
                info: {
                    number: ticket,
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
