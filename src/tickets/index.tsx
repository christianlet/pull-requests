/* eslint-disable react-hooks/exhaustive-deps */
import { Refresh, Search } from '@mui/icons-material'
import { CircularProgress, IconButton, InputAdornment, Pagination, SelectChangeEvent, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks'
import { peerReviewSlice } from '../redux/reducers/peer-reviews-reducer'
import { Ticket } from './ticket'
import { TicketsState } from '../types/api-types'
import { getPullRequests } from '../utilities/git-api/pulls/get-pull-requests'
import { AuthorsSelect } from './authors-select'
import './styles.scss'
import { useSearchParams } from 'react-router-dom'


type DialogActionState = {
    action: string
    ticket: TicketsState
} | null

export const Tickets = (props: any) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [ticketDialogData, setTicketDialogData] = useState<DialogActionState>(null)
    const [totalPeerReviewCount, setTotalPeerReviewCount] = useState(0)
    const [refresh, setRefresh] = useState(new Date().getTime())
    const author = searchParams.get('author') ?? '@me'
    const state = searchParams.get('state') as 'open' | 'closed' ?? 'open'
    const prType = searchParams.get('prType') ?? 'created'
    const page = searchParams.get('page') ?? '1'
    const dispatch = useAppDispatch()
    const theme = useTheme()
    const tickets = useAppSelector(state => state.peerReviews.value)

    useEffect(() => {
        getPeerReviews()
    }, [searchParams])

    useEffect(() => {
        if(ticketDialogData) {
            tickets?.forEach(ticket => {
                if(ticket.info.number === ticketDialogData.ticket.info.number) {
                    setTicketDialogData({
                        ...ticketDialogData,
                        ticket
                    })
                }
            })

        }
    }, [tickets])

    const getPeerReviews = async () => {
        dispatch(peerReviewSlice.actions.set(null))

        const response  = await getPullRequests(
            author,
            prType !== 'created',
            state,
            page
        )

        setTotalPeerReviewCount(response.totalCount)
        dispatch(peerReviewSlice.actions.set(response.tickets))
    }

    const handlePrState = (event: React.MouseEvent<HTMLElement>, value: 'open' | 'closed') => {
        searchParams.set('state', value)

        setSearchParams(searchParams)
    }

    const handleSelect = ({ target: { value } }: SelectChangeEvent) => {
        searchParams.set('author', value)

        setSearchParams(searchParams)
    }

    return (
        <>
            <Box paddingX="50px" paddingY="25px">
                <Box
                    className="filter-container"
                    sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.300'
                    }}
                >
                    <div>
                        <AuthorsSelect
                            value={author}
                            onChange={handleSelect}
                            disabled={tickets === null || prType !== 'created'}
                        />
                    </div>
                    <div style={{
                        flexGrow: 2,
                        textAlign: 'center'
                    }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            fullWidth
                            placeholder='Search for Pull Requests'
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment
                                            position='start'
                                        >
                                            <Search />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            style={{
                                padding: '0 10px',
                                maxWidth: 700
                            }}
                        />
                    </div>
                    <div>
                        <div>
                            <ToggleButtonGroup
                                size="small"
                                color="info"
                                value={state}
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
                    justifyContent="flex-end"
                    marginBottom={2}
                >
                    <Pagination
                        count={Math.ceil((totalPeerReviewCount / 25) || 0)}
                        page={parseInt(page, 10)}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        onChange={(event, page) => {
                            searchParams.set('page', page.toString())

                            setSearchParams(searchParams)
                        }}
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
                                ticket={ticket.info}
                                data={ticket.repos}
                                prType={prType}
                            />
                        ))
                    }
                </Box>
            </Box>
        </>
    )
}
