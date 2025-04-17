/* eslint-disable react-hooks/exhaustive-deps */
import { Refresh, Search } from '@mui/icons-material'
import { CircularProgress, IconButton, InputAdornment, Pagination, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { Ticket } from './ticket'
import { getPullRequests } from '../../utilities/git-api/pulls/get-pull-requests'
import './styles.scss'
import { useSearchParams } from 'react-router-dom'
import { TicketsState } from '../../types/api-types'
import { groupPullRequests } from '../../utilities/group-pull-requests'

interface State {
    items: null | TicketsState[]
    total: number
}

export const Tickets = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [refresh, setRefresh] = useState(new Date().getTime())
    const [query, setQuery] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [tickets, setTickets] = useState<State>({
        items: null,
        total: 0
    })
    const state = searchParams.get('state') as 'open' | 'closed' ?? 'open'
    const prType = searchParams.get('prType') ?? 'created'
    const page = searchParams.get('page') ?? '1'
    const theme = useTheme()

    useEffect(() => {
        const handler = setTimeout(() => {
            setQuery(inputValue)
        }, 500); // Delay of 500 milliseconds

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    const handleChange = (event: any) => {
        setInputValue(event.target.value);
    };

    useEffect(() => {
        getPeerReviews()
    }, [searchParams, refresh, query])

    const getPeerReviews = async () => {
        setTickets({
            items: null,
            total: 0
        })

        const response  = await getPullRequests({
            q: `author:@me+is:${state} ${query}`,
            page: parseInt(page, 10)
        })

        setTickets({
            items: groupPullRequests(response.items),
            total: response.totalCount
        })
    }

    const handlePrState = (event: React.MouseEvent<HTMLElement>, value: 'open' | 'closed') => {
        searchParams.set('state', value)

        setSearchParams(searchParams)
    }

    return (
        <Box>
            <Box
                className="filter-container"
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#424242' : 'darkgray'
                }}
            >
                <div style={{
                    flexGrow: 1
                }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder='Search for Pull Requests'
                        onChange={handleChange}
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
                            maxWidth: 300
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
                    count={Math.ceil((tickets.total / 50) || 0)}
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
                    tickets.items === null
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
                    ) : tickets.items.map((ticket, index) => (
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
    )
}
