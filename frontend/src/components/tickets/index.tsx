/* eslint-disable react-hooks/exhaustive-deps */
import { Refresh, Search } from '@mui/icons-material'
import { Autocomplete, CircularProgress, IconButton, InputAdornment, Pagination, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { GitHubClient } from '../../clients/github-client'
import { AuthenticatedUser, TicketsState, User } from '../../types/api-types'
import { groupPullRequests } from '../../utilities/group-pull-requests'
import './styles.scss'
import { Ticket } from './ticket'

interface State {
    items: null | TicketsState[]
    total: number
}

export const Tickets = () => {
    const { authUser } = useOutletContext<{ authUser: AuthenticatedUser }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [refresh, setRefresh] = useState(new Date().getTime())
    const [query, setQuery] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [tickets, setTickets] = useState<State>({
        items: null,
        total: 0
    })
    const [author, setAuthor] = useState(searchParams.get('author')?.split(',') ?? [authUser.login])
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<readonly User[]>([])
    const [loading, setLoading] = React.useState(false)
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
    }, [inputValue])

    useEffect(() => {
        if (!authUser) {
            return
        }

        getPeerReviews()
    }, [searchParams, refresh, query, author])

    const handleOpen = () => {
        setOpen(true)

        if (!options.length) {
            ;(async () => {
                setLoading(true)

                const client = GitHubClient.getInstance()
                const users = await client.getUsers()

                setLoading(false)

                setOptions([...users])
            })()
        }
    }

    const handleClose = () => {
        setOpen(false)
    };

    const handleInputChange = (event: any) => {
        setInputValue(event.target.value);
    };

    const handleSelectChange = (value: null | User[]) => {
        if (!value || !value.length) {
            return
        }

        const logins = value.map(v => v.login)

        setAuthor(logins)

        searchParams.set('author', logins.join(','))

        setSearchParams(searchParams)
    };

    const getPeerReviews = async () => {
        setTickets({
            items: null,
            total: 0
        })

        const client = GitHubClient.getInstance()
        const response  = await client.getPullRequests({
            q: `${author.map(a => `author:${a}`).join('+')}+is:${state} ${query}`,
            page: parseInt(page, 10)
        }).catch(e => {
            console.log(e)

            return {
                items: [],
                totalCount: 0
            }
        })

        setTickets({
            items: groupPullRequests(response.items),
            total: response.totalCount
        })
    }

    const handlePrState = (event: React.MouseEvent<HTMLElement>, value: 'open' | 'closed') => {
        if(value !== null) {
            searchParams.set('state', value)

            setSearchParams(searchParams)
        }
    }

    return (
        <Box>
            <Box
                className="filter-container"
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#424242' : 'darkgray'
                }}
            >
                <div>
                    {
                        authUser && (
                            <Autocomplete
                                sx={{ width: 300 }}
                                size='small'
                                multiple={true}
                                limitTags={1}
                                open={open}
                                onOpen={handleOpen}
                                onClose={handleClose}
                                disabled={tickets.items === null}
                                defaultValue={[authUser]}
                                isOptionEqualToValue={(option, value) => option.login === value.login}
                                getOptionLabel={(option) => option.name || option.login}
                                onChange={(_, value) => handleSelectChange(value)}
                                // onInputChange={(_, value) => setAuthorInputValue(value)}
                                options={options}
                                loading={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Author"
                                        slotProps={{
                                            input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                            },
                                        }}
                                    />
                                )}
                                />
                        )
                    }
                </div>
                <div style={{
                    flexGrow: 1
                }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder='Search for Pull Requests'
                        onChange={handleInputChange}
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
