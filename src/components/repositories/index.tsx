import { CopyAll, Search } from '@mui/icons-material'
import { Box, Button, Checkbox, Chip, CircularProgress, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
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
    const [reposSelected, setReposSelected] = useState<Repos['items']>([])

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
        setReposSelected([])
        setRepos({
            total: 0,
            items: []
        })

        getRepos().then(async initialRes => {
            let data = initialRes.items

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

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(event.target.id, 10)

        if(event.target.checked) {
            const repo = repos.items.find(repo => repo.id === id)

            if(repo) {
                setReposSelected([...reposSelected, repo])
            }
        } else {
            const newSelectedRepos = [...reposSelected]
            const index = reposSelected.findIndex(sr => sr.id === id)

            newSelectedRepos.splice(index, 1)

            setReposSelected(newSelectedRepos)
        }
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
                    <Chip
                        label={`Total repositories: ${repos.total}`}
                        sx={{ marginBottom: 1, marginTop: 5 }}
                    />
                </Box>
            </Stack>
            <TableContainer
                component={Paper}
                variant='outlined'
                sx={{ maxHeight: 600}}
            >
                <Table
                    stickyHeader
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Button
                                    variant='contained'
                                    color='success'
                                    startIcon={<CopyAll />}
                                    disabled={reposSelected.length === 0}
                                    onClick={() => {
                                        let reposToCopy = reposSelected.map(repo => {
                                            const dir = localRepositoriesDirectory + '/' + repo.name

                                            return `git clone git@github.com:${repo.full_name} ${dir}`
                                        })

                                        navigator.clipboard.writeText(reposToCopy.join(' && '))
                                    }}
                                >
                                    Clone
                                </Button>
                            </TableCell>
                            <TableCell>Org</TableCell>
                            <TableCell>Repo</TableCell>
                            <TableCell>Main Branch</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            aip && (
                                <TableCell colSpan={4}>
                                    <Typography sx={{ marginRight: 1, display: 'inline-block', verticalAlign: 'center' }}>
                                        Loading
                                    </Typography>
                                    <CircularProgress size='20px' />
                                </TableCell>
                            )
                        }
                        {
                            repos.items.length === 0 && !aip && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        align='center'
                                    >No data found</TableCell>
                                </TableRow>
                            )
                        }
                        {
                            repos.items.map((repo, i) => {
                                return (
                                    <TableRow key={`${repo.full_name}`}>
                                        <TableCell>
                                            <Checkbox
                                                id={repo.id.toString()}
                                                onChange={handleCheckboxChange}
                                                checked={reposSelected.find(selectedRepo => selectedRepo.id === repo.id) !== undefined}
                                            />
                                        </TableCell>
                                        <TableCell>{repo.owner?.login}</TableCell>
                                        <TableCell>{repo.name}</TableCell>
                                        <TableCell>{repo.default_branch}</TableCell>
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
