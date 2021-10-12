import { Refresh } from '@mui/icons-material'
import { CircularProgress, IconButton, SelectChangeEvent, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks'
import { peerReviewSlice } from '../redux/reducers/peer-reviews-reducer'
import { Ticket } from '../ticket'
import { getPullRequests, PullRequest } from '../utilities/github-api'
import { ClosePulls } from './action-dialogs/close-pulls'
import { DevBranch } from './action-dialogs/dev-branch'
import { Diffs } from './action-dialogs/diffs'
import { AuthorsSelect } from './authors-select'
import './styles.scss'

export interface TicketsState {
    ticket: string
    repos: PullRequest[]
}

type DialogActionState = {
    action: string
    ticket: TicketsState
} | null

export const Tickets = () => {
    const currentUrlParams = new URLSearchParams(window.location.search)
    const [ticketDialogData, setTicketDialogData] = useState<DialogActionState>(null)
    const [prType, setPrType] = useState(currentUrlParams.get('pr_type') ?? 'created')
    const history = useHistory()
    const [author, setAuthor] = useState<string>(prType === 'created' ? '@me' : '')
    const [refresh, setRefresh] = useState(0)
    const dispatch = useAppDispatch()
    const tickets = useAppSelector(state => state.peerReviews.value)

    useEffect(() => {
        currentUrlParams.set('pr_type', prType)

        history.push({ search: currentUrlParams.toString() })

        if(prType === 'created') {
            setAuthor('@me')
        } else {
            setAuthor('')
        }
    }, [prType])

    useEffect(() => {
        getPeerReviews()
    }, [prType])

    useEffect(() => {
        if(ticketDialogData) {
            tickets?.forEach(ticket => {
                if(ticket.ticket === ticketDialogData.ticket.ticket) {
                    setTicketDialogData({
                        ...ticketDialogData,
                        ticket: {
                            ...ticket,
                            repos: [...ticket.repos]
                        }
                    })
                }
            })

        }
    }, [tickets])

    const getPeerReviews = async () => {
        const t = await getPullRequests(author, prType !== 'created')

        dispatch(peerReviewSlice.actions.set(t))
    }

    const handlePrType = (event: React.MouseEvent<HTMLElement>, value: string | null) => {
        const type = value ?? 'created'

        setPrType(type)
    }

    const handleDialogOpen = (action: string, ticket: TicketsState) => setTicketDialogData({
        action,
        ticket
    })
    const handleDialogClose = () => setTicketDialogData(null)

    const handleSelect = ({ target: { value } }: SelectChangeEvent) => {
        setAuthor(value)
    }

    return (
        <>
            {
                ticketDialogData?.action === 'delete' && <ClosePulls ticket={ticketDialogData.ticket} closeDialog={handleDialogClose} />
            }
            {
                ticketDialogData?.action === 'diff' && <Diffs ticket={ticketDialogData.ticket} closeDialog={handleDialogClose} />
            }
            {
                ticketDialogData?.action === 'dev-branch' && <DevBranch ticket={ticketDialogData.ticket} closeDialog={handleDialogClose} />
            }
            <Box paddingX="50px" paddingY="25px">
                <Box className="filter-container">
                    <div>
                        <AuthorsSelect
                            value={author}
                            onChange={handleSelect}
                            disabled={tickets === null}
                        />
                    </div>
                    <div>
                        <div>
                            <ToggleButtonGroup
                                color="primary"
                                size="small"
                                value={prType}
                                exclusive={true}
                                onChange={handlePrType}
                                disabled={tickets === null}
                                sx={{
                                    backgroundColor: 'white'
                                }}
                            >
                                <ToggleButton value="created">Created</ToggleButton>
                                <ToggleButton value="assigned">Review Requested</ToggleButton>
                            </ToggleButtonGroup>
                            <IconButton
                                sx={{ marginLeft: 1 }}
                                onClick={() => setRefresh(refresh+1)}
                                disabled={tickets === null}
                            >
                                <Refresh />
                            </IconButton>
                        </div>
                        <div>
                        </div>
                    </div>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center'
                }}>
                    {
                        !tickets
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
