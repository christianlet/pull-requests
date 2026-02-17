import { ErrorOutline, KeyboardBackspace, Launch } from '@mui/icons-material'
import { Box, Checkbox, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { EditablePullRequest } from '../action/types/editable-pull-request'

interface Props {
    repos: EditablePullRequest[]
    loadingRepos: boolean
    aip: boolean
    selectedRepos: EditablePullRequest[]
    setSelectedRepos: (repos: EditablePullRequest[]) => void
    disableCheckbox?: (repo: EditablePullRequest) => boolean
}

export const BranchTable = ({ repos, ...props }: Props) => {
    const [toggleSelect, setToggleSelect] = useState(false)
    const isCheckboxDisabled = !props.disableCheckbox ? (repo: EditablePullRequest) => false : props.disableCheckbox
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(event.target.id, 10)

        if(event.target.checked) {
            const repo = repos.find(repo => repo.id === id)

            if(repo) {
                props.setSelectedRepos([...props.selectedRepos, repo])
            }
        } else {
            const newSelectedRepos = [...props.selectedRepos]
            const index = props.selectedRepos.findIndex(sr => sr.id === id)

            newSelectedRepos.splice(index, 1)

            props.setSelectedRepos(newSelectedRepos)
        }
    }

    useEffect(() => {
        if(props.selectedRepos.length === 0) {
            setToggleSelect(false)
        } else if(props.selectedRepos.length === repos.length) {
            setToggleSelect(true)
        }
    }, [props.selectedRepos, repos])

    return (
        <TableContainer component={Paper} elevation={5}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={3}></TableCell>
                        <TableCell colSpan={2} align='center'>Releases</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="center">
                            <Checkbox
                                checked={toggleSelect}
                                disabled={props.aip}
                                onChange={(event) => {
                                    if(event.target.checked) {
                                        const allRepos = repos
                                            .filter(repo => !isCheckboxDisabled(repo))
                                            .filter(repo => repo.state === 'open')

                                        props.setSelectedRepos(allRepos)
                                    } else {
                                        props.setSelectedRepos([])
                                    }

                                    setToggleSelect(event.target.checked)
                                }}
                            />
                        </TableCell>
                        <TableCell>Repository</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell>Latest</TableCell>
                        <TableCell>Current</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { props.loadingRepos && (
                        <TableRow>
                            <TableCell colSpan={5} align='center'>Loading...</TableCell>
                        </TableRow>
                    )}
                    {
                        repos.map((repo, i) => {
                            const mainBranch = repo.base.ref === repo.base.repo.default_branch && !repo.head.ref.includes('/release/')
                            const selected = props.selectedRepos.find(selectedRepo => selectedRepo.id === repo.id)
                            const isActionable = !isCheckboxDisabled(repo)

                            return (
                                <TableRow key={repo.id}>
                                    <TableCell align="center">
                                        { repo.state === 'open' && (<Checkbox
                                            id={repo.id.toString()}
                                            disabled={props.aip || !isActionable}
                                            checked={selected !== undefined}
                                            onChange={handleCheckboxChange}
                                        />)}
                                        {
                                            repo.state !== 'open' && (
                                                <Typography fontSize={10} color="success">{repo.merged ? 'Merged' : 'Closed'}</Typography>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            {repo.base.repo.full_name}
                                            <IconButton
                                                onClick={() => window.open(repo.html_url, '_blank')}
                                            >
                                                <Launch fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <Chip
                                                    label={selected?.edits?.target_branch || repo.base.ref}
                                                    size="small"
                                                    color={selected?.edits?.target_branch ? 'primary' : 'default'}
                                                    variant="filled"
                                                />
                                                <KeyboardBackspace fontSize="small" sx={{ marginX: 1 }}/>
                                                <Chip
                                                    label={repo.head.ref}
                                                    size="small"
                                                    color="default"
                                                    variant="filled"
                                                />
                                            </div>
                                            {
                                                mainBranch && (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            fontSize: 11,
                                                            marginTop: '5px'
                                                        }}
                                                    >
                                                        <ErrorOutline fontSize="small" color="warning" />
                                                        <Typography
                                                            fontSize={12}
                                                            color="warning"
                                                            marginLeft={1}
                                                        >Targeting default branch</Typography>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {
                                            repo.tags.latest && (
                                                <Chip
                                                    label={repo.tags.latest?.tag_name}
                                                    size='small'
                                                    color='primary'
                                                />
                                            )
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            repo.tags.current && (
                                                <Chip
                                                    label={repo.tags.current?.tag_name}
                                                    size='small'
                                                    color='default'
                                                />
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}
