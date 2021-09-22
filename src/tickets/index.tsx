import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { Ticket } from '../ticket'
import { usePullRequestsHook } from '../utilities/github-api'

interface TicketsState {
    [index: string]: any[]
}

export const Tickets = (props: any) => {
    const [tickets, setTickets] = useState<null|TicketsState>(null)
    const pullRequests = usePullRequestsHook()

    useEffect(() => {
        const groupedPRs: TicketsState = {}

        pullRequests.forEach(pr => {
            if(pr) {
                if(!groupedPRs.hasOwnProperty(pr.branches.head)) {
                    groupedPRs[pr.branches.head] = []
                }

                groupedPRs[pr.branches.head].push(pr)
            }
        })

        if(Object.keys(groupedPRs).length) {
            setTickets(groupedPRs)
        } else {
            setTickets(null)
        }
    }, [pullRequests])

    return (
        <Box paddingX="50px" paddingY="25px">
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center'
            }}>
                {
                    !tickets
                    ? <></>
                    : Object.keys(tickets).map(key => (
                        <Ticket
                            key={key}
                            title={key}
                            data={tickets[key]}
                        />
                    ))
                }
            </Box>
        </Box>
    )
}
