
export const jiraTicket = (ticket: string) => {
    const jiraLinkRegex = /(CPENY|LANDO|SPARK|CMS[A-Z0-9]+)-[0-9]+/g
    const ticketNumber = ticket.toUpperCase().match(jiraLinkRegex)?.pop()

    return ticketNumber ? `https://teamfox.atlassian.net/browse/${ticketNumber}` : null
}