import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { OctokitClient } from '../utilities/octokit-client'
import { Octokit } from '@octokit/rest'

export const TicketDetailPage = (props: unknown) => {
    const { ticketId } = useParams<{ ticketId: string }>()
    const [octokit, setOctokit] = useState<null | false | Octokit>(null)
    const [pullRequests, setPullRequests] = useState<any[]>([])

    useEffect(() => {
        OctokitClient.getInstance()
            .then((octokit) => {
                setOctokit(octokit)
            })
            .catch((error) => {
                console.error(error)

                setOctokit(false)
            })
    }, [ticketId])

    useEffect(() => {
        if (octokit) {
          octokit.search.issuesAndPullRequests({
            q: `is:pr head:${ticketId}`
          }).then((response) => {
            setPullRequests(response.data.items)
          })
        }
    }, [octokit, ticketId])

    if(!octokit) {
        return (
            <div>
                {octokit === null && <div>Loading octokit...</div>}
                {octokit === false && <div>Failed to load octokit</div>}
            </div>
        )
    }

    return (
        <>
            <h1>{ticketId}</h1>
            <pre>{JSON.stringify(pullRequests, undefined, 4)}</pre>
        </>
    )
}
