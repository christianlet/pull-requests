import { Box, Button, FormControl, FormControlLabel, FormGroup, FormLabel, InputAdornment, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import './styles.scss'
import { BranchTable } from '../branch-table'
import { ActionProps } from './types/action-props'
import { useNavigate } from 'react-router-dom'
import { LongPress } from '../long-press'
import { setTargetBranch } from '../../utilities/set-target-branch'

export const TargetBranch = ({ selectedRepos, setSelectedRepos, ...props }: ActionProps) => {
    const navigate = useNavigate()
    const [branchType, setBranchType] = useState('personal')
    const [team, setTeam] = useState('cms3')
    const [releaseVersion, setReleaseVersion] = useState('')
    const [baseBranch, setBaseBranch] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const branchPrefix = branchType === 'personal' ? `personal/${props.user?.login}/` : 'collab/'
    const targetBranch = branchType === 'release' ? `collab/${team}/release/${releaseVersion}` : branchPrefix + baseBranch

    const handleSubmit = async () => {
        if(baseBranch === '' || (branchType === 'release' && releaseVersion === '')) {
            console.log('Invalid branch name')
            console.log({
                baseBranch,
                branchType,
                releaseVersion
            })


            return
        }

        setIsSubmitting(true)

        for (const repo of selectedRepos) {
            try {
                await setTargetBranch(repo, targetBranch)
            } catch (error) {
                console.log(error)
            }
        }


        setBaseBranch('')
        setReleaseVersion('')
        setSelectedRepos([])
        setIsSubmitting(false)
        props.setRefreshRepos(new Date().getTime())
    }

    useEffect(() => {
      setBaseBranch(targetBranch)
    }, [branchType])


    return (
        <>
            <Box sx={{ marginBottom: 5 }}>
                <FormGroup sx={{
                    marginBottom: 2,
                }}>
                    <FormControl>
                        <FormLabel>Branch Type</FormLabel>
                        <RadioGroup
                            defaultValue='personal'
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
                    <FormControl sx={{ width: 500 }}>
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
                    marginBottom: 2,
                    width: 500
                }}>
                    <FormControl>
                        <TextField
                            label="Release Version"
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                            value={releaseVersion}
                            error={releaseVersion.match(/^[0-9]{1,3}\.[0-9]{1,3}(\.[0-9]{1,3})?$/) === null}
                            onChange={e => setReleaseVersion(e.target.value)}
                            required={branchType === 'release'}
                            slotProps={{
                                input: {
                                    placeholder: '1.0.0'
                                }
                            }}
                        />
                    </FormControl>
                </FormGroup>
                <FormGroup sx={{ width: 500 }}>
                    <FormControl>
                        <TextField
                            label="Target Branch"
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                            value={branchType === 'release' ? targetBranch : baseBranch}
                            error={branchType !== 'release' && baseBranch.match(/[A-Za-z0-9_-]/) === null}
                            onChange={e => setBaseBranch(e.target.value)}
                            required
                            disabled={branchType === 'release'}
                            slotProps={{
                                input: {
                                    startAdornment: branchType === 'release' ? <></> : <InputAdornment position="start">{branchType === 'personal' ? `personal/${props.user?.login}` : 'collab'}/</InputAdornment>
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
                        target_branch: targetBranch
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
                <LongPress
                    loading={isSubmitting}
                    disabled={selectedRepos.length === 0 || targetBranch.match(/(\/)$/) !== null}
                    onSubmit={handleSubmit}
                />
            </div>
        </>
    )
}
