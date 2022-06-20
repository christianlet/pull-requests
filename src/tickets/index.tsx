/* eslint-disable react-hooks/exhaustive-deps */
import { Refresh, Search } from '@mui/icons-material'
import { CircularProgress, IconButton, InputAdornment, Pagination, SelectChangeEvent, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router'
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks'
import { peerReviewSlice } from '../redux/reducers/peer-reviews-reducer'
import { Ticket } from '../ticket'
import { TicketsState } from '../types/api-types'
import { getPullRequests } from '../utilities/git-api/pulls/get-pull-requests'
import { ClosePulls } from './action-dialogs/close-pulls'
import { DevBranch } from './action-dialogs/dev-branch'
import { MergePRs } from './action-dialogs/merge-prs'
import { AuthorsSelect } from './authors-select'
import './styles.scss'


type DialogActionState = {
    action: string
    ticket: TicketsState
} | null

type FilterState = {
    prType: string
    author: string
    state: 'open' | 'closed'
    page: number
}

export const Tickets = () => {
    const currentUrlParams = useMemo(() =>
        new URLSearchParams(window.location.search),
        []
    )
    const [ticketDialogData, setTicketDialogData] = useState<DialogActionState>(null)
    const [totalPeerReviewCount, setTotalPeerReviewCount] = useState(0)
    const [filters, setFilters] = useState<FilterState>({
        prType: currentUrlParams.get('pr_type') ?? 'created',
        author: currentUrlParams.get('author') ?? '@me',
        state: (currentUrlParams.get('state') as ('open' | 'closed')) ?? 'open',
        page: parseInt(currentUrlParams.get('page') ?? '1', 10)
    })
    const history = useHistory()
    const [refresh, setRefresh] = useState(0)
    const dispatch = useAppDispatch()
    const theme = useTheme()
    const tickets = useAppSelector(state => state.peerReviews.value)

    useEffect(() => {
        currentUrlParams.set('pr_type', filters.prType)
        currentUrlParams.set('author', filters.author)
        currentUrlParams.set('state', filters.state)
        currentUrlParams.set('page', filters.page.toString())

        history.push({ search: currentUrlParams.toString() })

        getPeerReviews()
    }, [filters, history, currentUrlParams, refresh])

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
        dispatch(peerReviewSlice.actions.set(null))

        const reviewing = filters.prType !== 'created'
        const response  = await getPullRequests(filters.author, reviewing, filters.state, filters.page)

        setTotalPeerReviewCount(response.totalCount)
        dispatch(peerReviewSlice.actions.set(response.tickets))
    }

    const handlePrState = (event: React.MouseEvent<HTMLElement>, value: 'open' | 'closed') => {
        setFilters({
            ...filters,
            state: value
        })
    }

    const handleDialogOpen = (action: string, ticket: TicketsState) => setTicketDialogData({
        action,
        ticket
    })
    const handleDialogClose = () => setTicketDialogData(null)

    const handleSelect = ({ target: { value } }: SelectChangeEvent) => setFilters({
        ...filters,
        author: value
    })

    const handlePageChange = (event: unknown, page: number) => setFilters({
        ...filters,
        page
    })

    return (
        <>
            {
                ticketDialogData?.action === 'delete' && <ClosePulls ticket={ticketDialogData.ticket} closeDialog={handleDialogClose} />
            }
            {
                ticketDialogData?.action === 'dev-branch' && <DevBranch ticket={ticketDialogData.ticket} closeDialog={handleDialogClose} />
            }
            {
                ticketDialogData?.action === 'merge-prs' &&
                    <MergePRs
                        ticket={ticketDialogData.ticket}
                        closeDialog={handleDialogClose}
                        refresh={() => setRefresh(refresh+1)}
                    />
            }
            <Box paddingX="50px" paddingY="25px">
                <Box
                    className="filter-container"
                    sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.300'
                    }}
                >
                    <div>
                        <AuthorsSelect
                            value={filters.author}
                            onChange={handleSelect}
                            disabled={tickets === null || filters.prType !== 'created'}
                        />
                    </div>
                    <div>
                        <div>
                            <ToggleButtonGroup
                                size="small"
                                color="info"
                                value={filters.state}
                                exclusive={true}
                                onChange={handlePrState}
                                disabled={tickets === null}
                                sx={{
                                    bgcolor: 'background.paper',
                                    marginRight: 1
                                }}
                            >
                                <ToggleButton value="open">Open</ToggleButton>
                                <ToggleButton value="closed">Closed</ToggleButton>
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
                <Box
                    display="flex"
                    justifyContent="space-between"
                    marginBottom={2}
                >
                    <TextField
                        variant="outlined"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment
                                    position='start'
                                >
                                    <Search />
                                </InputAdornment>
                            )
                        }}
                    />
                    <Pagination
                        count={Math.ceil((totalPeerReviewCount / 25) ?? 0)}
                        page={filters.page}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        onChange={handlePageChange}
                    />
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
                                prType={filters.prType}
                                openTicketDetail={action => handleDialogOpen(action, ticket)}
                            />
                        ))
                    }
                </Box>
            </Box>
        </>
    )
}
