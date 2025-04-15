import { Box, Button, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, InputAdornment, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from '@mui/material'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import './styles.scss'
import { BranchTable } from '../branch-table'
import { ActionProps } from './types/action-props'
import { useNavigate } from 'react-router-dom'
import { setTargetBranch } from '../../utilities/set-target-branch'
import { LoadingButton } from '@mui/lab'
import { Api } from '../../utilities/git-api/storage/api'
import { Release } from '../../types/releases/release'

const releaseTeamChipColors = (team: string) => {
    switch (team) {
        case 'cms1':
            return 'warning'
        case 'cms2':
            return 'info'
    }

    return 'success'
}

const DEFAULT_TEAM = 'cms3'

export const TargetBranch = ({ selectedRepos, setSelectedRepos, ...props }: ActionProps) => {
    const navigate = useNavigate()
    const releaseStorage = useMemo(() => new Api<Release>('releases'), [])
    const [formState, setFormState] = useState({
        branchType: 'release',
        team: DEFAULT_TEAM,
        releaseUrl: '',
        baseBranch: ''
    })
    const [newRelease, setNewRelease] = useState(true)
    const [existingReleases, setExistingReleases] = useState<Release[]>([])
    const [aip, setAip] = useState(false)

    const branchPrefix = formState.branchType === 'personal'
        ? `personal/${props.user?.login}/`
        : formState.branchType === 'release'
            ? `collab/${formState.team}/release/`
            : 'collab/'

    const setBaseBranch = async (branch: string) => {
        let newFormState = {
            ...formState,
            baseBranch: branch
        }

        if(!newRelease) {
            setAip(true)

            const releaseStorage = new Api<Release>('releases')
            const releaseKey = `${formState.team}-${branch}`
            const release = await releaseStorage.get(releaseKey)

            if(release) {
                newFormState = {
                    ...newFormState,
                    releaseUrl: release.url
                }
            } else {
                newFormState = {
                    ...newFormState,
                    releaseUrl: ''
                }
            }
        }

        setFormState(newFormState)
        setAip(false)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setAip(true)

        if(formState.branchType === 'release' && newRelease) {
            const id = `${formState.team}-${formState.baseBranch}`

            releaseStorage.create(id, {
                id,
                url: formState.releaseUrl,
                version: formState.baseBranch,
                team: formState.team
            })
        }

        const fullBranch = branchPrefix + formState.baseBranch

        for (const repo of selectedRepos) {
            try {
                await setTargetBranch(repo, fullBranch)
            } catch (error) {
                console.log(error)
            }
        }

        setFormState({
            ...formState,
            baseBranch: '',
            releaseUrl: ''
        })
        setSelectedRepos([])
        setAip(false)
        props.setRefreshRepos(new Date().getTime())
    }

    useEffect(() => {
        if(!newRelease) {
            releaseStorage.getAll().then(({ items }) => {
                const sortedItems = items.sort((a, b) => a.id.localeCompare(b.id))
                setExistingReleases(sortedItems)
            })
        }
    }, [newRelease, releaseStorage])

    useEffect(() => {
        if (formState.branchType !== 'release') {
            setNewRelease(true)
        }
    }, [formState.branchType])

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ marginBottom: 5 }}>
                <FormGroup row sx={{
                    display: 'flex',
                    marginBottom: 2,
                }}>
                    <FormControl>
                        <FormLabel required>Branch Type</FormLabel>
                        <RadioGroup
                            defaultValue='release'
                            onChange={e => setFormState({
                                ...formState,
                                baseBranch: '',
                                team: DEFAULT_TEAM,
                                branchType: e.target.value
                            })}
                            row
                            sx={{
                                justifyContent: 'flex-start'
                            }}
                        >
                            <FormControlLabel value='personal' control={<Radio />} label='Personal' />
                            <FormControlLabel value='release' control={<Radio />} label='Release' />
                            <FormControlLabel value='collaboration' control={<Radio />} label='Collaboration' />
                        </RadioGroup>
                    </FormControl>
                    <FormControl
                        disabled={!newRelease}
                        sx={{
                            display: formState.branchType === 'release' ? 'block' : 'none',
                        }}
                    >
                        <FormLabel id="team" required>Team</FormLabel>
                        <RadioGroup
                            value={formState.team}
                            onChange={e => setFormState({
                                ...formState,
                                team: e.target.value as string
                            })}
                            row
                            sx={{
                                justifyContent: 'flex-start'
                            }}
                        >
                            <FormControlLabel value='cms1' control={<Radio />} label='CMS1' />
                            <FormControlLabel value='cms2' control={<Radio />} label='CMS2' />
                            <FormControlLabel value='cms3' control={<Radio />} label='CMS3' />
                        </RadioGroup>
                    </FormControl>
                </FormGroup>
                <FormGroup row sx={{
                    display: formState.branchType === 'release' ? 'flex' : 'none',
                    alignItems: 'center',
                    marginBottom: 2,
                    height: '95px'
                }}>
                    <FormControl sx={{
                        width: '250px !important',
                        paddingRight: '5px'
                    }}>
                        <InputLabel id="newRelease">New Release</InputLabel>
                        <Select
                            id="newRelease"
                            label="New Release"
                            value={newRelease ? 'yes' : 'no'}
                            onChange={e => {
                                setNewRelease(e.target.value === 'yes')
                                setFormState({
                                    ...formState,
                                    baseBranch: '',
                                    team: DEFAULT_TEAM
                                })
                            }}
                            sx={{
                                marginBottom: newRelease ? '-8px' : 0
                            }}
                        >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        {
                            newRelease ? (
                                <TextField
                                    label="Release Version"
                                    fullWidth={true}
                                    margin="normal"
                                    variant="outlined"
                                    autoComplete='off'
                                    value={formState.baseBranch}
                                    error={formState.baseBranch !== '' && formState.baseBranch.match(/^[0-9]{1,3}\.[0-9]{1,3}(\.[0-9]{1,3})?$/) === null}
                                    onChange={e => setBaseBranch(e.target.value)}
                                    required={formState.branchType === 'release'}
                                    slotProps={{
                                        input: {
                                            placeholder: '1.0.0'
                                        }
                                    }}
                                />
                            ) : (
                                <>
                                    <InputLabel
                                        id="existingRelease"
                                        required={formState.branchType === 'release'}
                                    >Release</InputLabel>
                                    <Select
                                        id="existingRelease"
                                        label="Release"
                                        value={`${formState.team}-${formState.baseBranch}`}
                                        required={formState.branchType === 'release'}
                                        onChange={e => {
                                            const [team, version] = e.target.value.split('-')

                                            setFormState({
                                                ...formState,
                                                team,
                                                baseBranch: version
                                            })
                                        }}
                                    >
                                        {
                                            existingReleases.map((item, i) => (
                                                <MenuItem value={item.id}>
                                                    <>
                                                        <Chip
                                                            label={item.team.toUpperCase()}
                                                            size="small"
                                                            color={releaseTeamChipColors(item.team)}
                                                            sx={{
                                                                marginRight: 2
                                                            }}
                                                        />
                                                    </>
                                                    {item.version}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </>
                            )
                        }
                    </FormControl>
                </FormGroup>
                <FormGroup sx={{
                    display: formState.branchType === 'release' ? 'block' : 'none',
                    marginBottom: 2
                }}>
                    <FormControl>
                        <TextField
                            label="Release URL"
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                            autoComplete='off'
                            value={formState.releaseUrl}
                            disabled={!newRelease}
                            required={formState.branchType === 'release'}
                            onChange={e => setFormState({
                                ...formState,
                                releaseUrl: e.target.value as string
                            })}
                            slotProps={{
                                input: {
                                    placeholder: 'ex: https://teamfox.atlassian.net/projects/CMS3/versions/24006'
                                }
                            }}
                        />
                    </FormControl>
                </FormGroup>
                <FormGroup>
                    <FormControl>
                        <TextField
                            label="Target Branch"
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                            value={formState.baseBranch}
                            error={formState.branchType !== 'release' && formState.baseBranch !== '' && formState.baseBranch.match(/^[A-Za-z0-9_-]+$/) === null}
                            onChange={e => setFormState({
                                ...formState,
                                baseBranch: e.target.value
                            })}
                            required
                            disabled={formState.branchType === 'release'}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">{branchPrefix}</InputAdornment>
                                }
                            }}
                        />
                    </FormControl>
                </FormGroup>
            </Box>
            <BranchTable
                repos={props.repos || []}
                loadingRepos={props.repos === null}
                selectedRepos={selectedRepos.map(repo => ({
                    ...repo,
                    edits: {
                        target_branch: branchPrefix + formState.baseBranch
                    }
                }))}
                aip={aip}
                setSelectedRepos={setSelectedRepos}
            />
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 25
            }}>
                <Button
                    color="error"
                    variant="outlined"
                    disabled={aip}
                    onClick={() => navigate('/prs')}
                    sx={{ marginRight: 2 }}
                >Back</Button>
                <LoadingButton
                    loading={aip}
                    variant="contained"
                    color="info"
                    size="large"
                    disabled={selectedRepos.length === 0}
                    type="submit"
                >Submit</LoadingButton>
            </div>
        </form>
    )
}
