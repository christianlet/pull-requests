export interface Team {
    name: string
    color: string
}

export const teams = [
    {
        name: 'CMS1',
        color: 'pink'
    },
    {
        name: 'CMS2',
        color: 'lightblue'
    },
    {
        name: 'CMS3',
        color: 'lightgreen'
    }
]

export const getTeam = (team: string) => {
    const teamLower = team.toLowerCase()
    const teamData = teams.find(t => t.name.toLowerCase() === teamLower)

    return teamData ?? null
}