import { CircularProgress, Dialog, DialogTitle, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { Ticket } from '../ticket'
import { PullRequest, usePullRequestsHook } from '../utilities/github-api'
import { ClosePulls } from './action-dialogs/close-pulls'
import './styles.scss'

export interface TicketsState {
    ticket: string
    repos: PullRequest[]
}

type DialogActionState = {
    action: string
    ticket: TicketsState
} | null

export const Tickets = (props: any) => {
    const currentUrlParams = new URLSearchParams(window.location.search)
    const [tickets, setTickets] = useState<TicketsState[]>([])
    const [ticketDialogData, setTicketDialogData] = useState<DialogActionState>(null)
    const [prType, setPrType] = useState(currentUrlParams.get('pr_type') ?? 'created')
    const history = useHistory()
    const pullRequests = usePullRequestsHook(prType !== 'created')

    useEffect(() => {
        const groupedPRs: TicketsState[] = []

        pullRequests?.forEach(pr => {
            const ticket  = pr.branches.head.split('/').pop() ?? ''
            const prIndex = groupedPRs.findIndex(repo => repo.ticket === ticket)

            if(prIndex === -1) {
                groupedPRs.push({
                    ticket,
                    repos: []
                })
            }

            groupedPRs[groupedPRs.length - 1].repos.push(pr)
        })

        setTickets(groupedPRs)
    }, [pullRequests])

    useEffect(() => {
        currentUrlParams.set('pr_type', prType)

        history.push({ search: currentUrlParams.toString() })
    }, [prType])

    const handlePrType = (event: React.MouseEvent<HTMLElement>, value: string | null) => {
        const type = value ?? 'created'

        setPrType(type)
    }

    const handleDialogOpen = (action: string, ticket: TicketsState) => setTicketDialogData({
        action,
        ticket
    })
    const handleDialogClose = () => setTicketDialogData(null)

    return (
        <>
            <Dialog
                open={ticketDialogData !== null}
                onClose={handleDialogClose}
            >
                {
                    ticketDialogData?.action === 'delete' && <ClosePulls ticket={ticketDialogData.ticket} />
                }
            </Dialog>
            <Box paddingX="50px" paddingY="25px">
                <Box className="filter-container">
                    <div>
                        <ToggleButtonGroup
                            color="primary"
                            size="small"
                            value={prType}
                            exclusive={true}
                            onChange={handlePrType}
                            disabled={pullRequests === null}
                            sx={{
                                backgroundColor: 'white'
                            }}
                        >
                            <ToggleButton value="created">My Peer Reviews</ToggleButton>
                            <ToggleButton value="assigned">Assigned Peer Reviews</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center'
                }}>
                    {
                        !pullRequests
                        ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 300,
                                width: 300,
                                marginTop: '50px'
                            }}>
                                    <CircularProgress />
                                    <div style={{ marginTop: '10px' }}>Loading...</div>
                            </Box>
                        ) : tickets.map((ticket, index) => (
                            <Ticket
                                key={index}
                                title={ticket.ticket}
                                data={ticket.repos}
                                prType={prType}
                                openTicketDetail={action => handleDialogOpen(action, ticket)}
                            />
                        ))
                    }
                </Box>
            </Box>
        </>
    )
}
