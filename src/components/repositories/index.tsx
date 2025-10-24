import { CopyAll, Search } from '@mui/icons-material'
import { Box, Button, CircularProgress, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { Endpoints } from '@octokit/types'
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AuthenticatedUser } from '../../types/api-types'
import { getRepositories } from '../../utilities/git-api/search/get-repositories'

interface Repos {
    total: number
    items: Endpoints['GET /search/repositories']['response']['data']['items']
}

const localRepositoriesDirectory = '~/Repositories'

export const Repositories = () => {
    const [aip, setAip] = useState(false)
    const { authUser } = useOutletContext<{ authUser: AuthenticatedUser }>()
    const [refresh, setRefresh] = useState(Date.now())
    const [searchText, setSearchText] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [repos, setRepos] = useState<Repos>({
        total: 0,
        items: []
    })

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchText(inputValue)
        }, 500); // Delay of 500 milliseconds

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    useEffect(() => {
        setAip(true)

        getRepos().then(async initialRes => {
            let data = initialRes.items
            const pages = Array.from({ length: Math.ceil(initialRes.total_count / 100) }).map((v, i) => i+1).slice(1)

            await Promise.all(
                pages.map(async page => {
                    const res = await getRepos(page)

                    data = data.concat(res.items)
                })
            )

            data.sort((a, b) => a.full_name.localeCompare(b.full_name))

            setRepos({
                total: initialRes.total_count,
                items: data
            })

            setAip(false)
        })
    }, [searchText])

    const getRepos = async (page = 1) => {
        const query = `org:foxcorp org:foxnews org:${authUser.login} ${searchText}`
        const { data } = await getRepositories(query, 100, page)

        return data
    }

    return (
        <>
            <Paper variant='elevation' elevation={0} sx={{ marginY: 2, padding: 2 }}>
                <Box component='form' display='flex'>
                    <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder='Search for repositories'
                        onChange={event => setInputValue(event.target.value)}
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
                            maxWidth: 500
                        }}
                    />
                </Box>
            </Paper>
            <Stack direction='row' justifyContent='space-between' alignItems='end' marginBottom={1} marginX={2}>
                <Box>
                    <Typography sx={{ marginBottom: 1, marginTop: 5 }}>
                        Total repositories: {repos.total}
                    </Typography>
                </Box>
                <Box>
                    {
                        aip && (
                            <>
                                <Typography sx={{ marginRight: 1, display: 'inline-block', verticalAlign: 'top' }}>
                                    Loading
                                </Typography>
                                <CircularProgress size='20px' />
                            </>
                        )
                    }
                </Box>
            </Stack>
            <TableContainer
                component={Paper}
                variant='outlined'
                sx={{ maxHeight: 600}}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Repo</TableCell>
                            <TableCell>Main Branch</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            repos.items.length === 0 && !aip && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        align='center'
                                    >No data found</TableCell>
                                </TableRow>
                            )
                        }
                        {
                            repos.items.map((repo, i) => {
                                const dir = localRepositoriesDirectory + '/' + repo.name

                                return (
                                    <TableRow key={`${repo.full_name}`}>
                                        <TableCell>{repo.full_name}</TableCell>
                                        <TableCell>{repo.default_branch}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant='contained'
                                                color='success'
                                                startIcon={<CopyAll />}
                                                onClick={() => navigator.clipboard.writeText(`git clone git@github.com:${repo.full_name} ${localRepositoriesDirectory}/${repo.name}`)}
                                            >
                                                Clone
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
