import { Box, Button, FormControl, FormControlLabel, FormGroup, FormLabel, InputAdornment, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from '@mui/material'
import { FormEvent, useEffect, useState } from 'react'
import './styles.scss'
import { BranchTable } from '../branch-table'
import { ActionProps } from './types/action-props'
import { useNavigate } from 'react-router-dom'
import { setTargetBranch } from '../../utilities/set-target-branch'
import { LoadingButton } from '@mui/lab'
import { SessionStorage } from '../../utilities/git-api/local-storage/session-storage'
import { Release } from '../../types/releases/release'

export const TargetBranch = ({ selectedRepos, setSelectedRepos, ...props }: ActionProps) => {
    const navigate = useNavigate()
    const [branchType, setBranchType] = useState('release')
    const [team, setTeam] = useState('cms3')
    const [releaseUrl, setReleaseUrl] = useState('')
    const [baseBranch, setBaseBranch] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const branchPrefix = branchType === 'personal'
        ? `personal/${props.user?.login}/`
        : branchType === 'release'
            ? `collab/${team}/release/`
            : 'collab/'

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIsSubmitting(true)

        if(branchType === 'release') {
            const releaseStorage = new SessionStorage<Release>('releases')

            releaseStorage.store(`${team}-${baseBranch}`, {
                url: releaseUrl,
                version: baseBranch
            })
        }

        const fullBranch = branchPrefix + baseBranch

        for (const repo of selectedRepos) {
            try {
                await setTargetBranch(repo, fullBranch)
            } catch (error) {
                console.log(error)
            }
        }

        setBaseBranch('')
        setSelectedRepos([])
        setIsSubmitting(false)
        props.setRefreshRepos(new Date().getTime())
    }

    useEffect(() => {
      setBaseBranch('')
    }, [branchType])

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ marginBottom: 5 }}>
                <FormGroup sx={{
                    marginBottom: 2,
                }}>
                    <FormControl>
                        <FormLabel>Branch Type</FormLabel>
                        <RadioGroup
                            defaultValue='release'
                            onChange={e => setBranchType(e.target.value)}
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
                </FormGroup>
                <FormGroup sx={{
                    display: branchType === 'release' ? 'block' : 'none',
                    marginBottom: 2
                }}>
                    <FormControl sx={{ width: 700 }}>
                        <InputLabel id="team" required>Team</InputLabel>
                        <Select
                            id="team"
                            label="Team"
                            value={team}
                            onChange={e => setTeam(e.target.value as string)}
                            required={branchType === 'release'}
                        >
                            <MenuItem value="cms1">CMS1</MenuItem>
                            <MenuItem value="cms2">CMS2</MenuItem>
                            <MenuItem value="cms3">CMS3</MenuItem>
                        </Select>
                    </FormControl>
                </FormGroup>
                <FormGroup sx={{
                    display: branchType === 'release' ? 'block' : 'none',
                    marginBottom: 2
                }}>
                    <FormControl sx={{ width: 700 }}>
                        <TextField
                            label="Release URL"
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                            value={releaseUrl}
                            required={branchType === 'release'}
                            onChange={e => setReleaseUrl(e.target.value)}
                            slotProps={{
                                input: {
                                    placeholder: 'ex: https://teamfox.atlassian.net/projects/CMS3/versions/24006'
                                }
                            }}
                        />
                    </FormControl>
                </FormGroup>
                <FormGroup sx={{
                    display: branchType === 'release' ? 'block' : 'none',
                    marginBottom: 2
                }}>
                    <FormControl sx={{ width: 250 }}>
                        <TextField
                            label="Release Version"
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                            value={baseBranch}
                            error={baseBranch !== '' && baseBranch.match(/^[0-9]{1,3}\.[0-9]{1,3}(\.[0-9]{1,3})?$/) === null}
                            onChange={e => setBaseBranch(e.target.value)}
                            required={branchType === 'release'}
                            slotProps={{
                                input: {
                                    placeholder: '1.0.0'
                                }
                            }}
                        />
                    </FormControl>
                </FormGroup>
                <FormGroup sx={{ width: 700 }}>
                    <FormControl>
                        <TextField
                            label="Target Branch"
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                            value={baseBranch}
                            error={branchType !== 'release' && baseBranch !== '' && baseBranch.match(/^[A-Za-z0-9_-]+$/) === null}
                            onChange={e => setBaseBranch(e.target.value)}
                            required
                            disabled={branchType === 'release'}
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
                        target_branch: branchPrefix + baseBranch
                    }
                }))}
                aip={isSubmitting}
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
                    disabled={isSubmitting}
                    onClick={() => navigate('/prs')}
                    sx={{ marginRight: 2 }}
                >Back</Button>
                <LoadingButton
                    loading={isSubmitting}
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
