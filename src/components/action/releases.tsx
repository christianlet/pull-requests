import { LoadingButton } from '@mui/lab'
import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PullRequestFull } from '../../types/api-types'
import { createRelease } from '../../utilities/git-api/releases/create-release'
import { OctokitClient } from '../../utilities/octokit-client'
import { UpdatePackageVersion } from '../../utilities/set-package-file-version'
import { sleep } from '../../utilities/sleep'
import { BranchTable } from '../branch-table'
import './styles.scss'
import { ActionProps } from './types/action-props'

export const Releases = ({ repos, selectedRepos, branch, setRefreshRepos, ...props }: ActionProps) => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        type: 'prerelease',
        identifier: ''
    })

    const submit = async () => {
        setIsSubmitting(true)

        const client = await OctokitClient.getInstance()

        await Promise.all(
            selectedRepos.map(async repo => {
                try {
                    const version = setVersion(repo.tags)

                    if(!version) {
                        return
                    }

                    const fileUpdater = new UpdatePackageVersion(repo.base.repo.owner.login, repo.base.repo.name, repo.head.ref, version)

                    await fileUpdater.run(client)
                    await createRelease(repo.base.repo.owner.login, repo.base.repo.name, repo.head.ref, version, repo.tags.current)
                } catch (error) {
                    console.error(error)
                }
            })
        )

        await sleep(3000)

        setIsSubmitting(false)
        setRefreshRepos(new Date().getTime())
    }

    const setVersion = (tags: PullRequestFull['tags']) => {
        const latestTag = tags.latest
        const currentTag = tags.current

        if(!latestTag && !currentTag) {
            console.log(`No versions to match against`)

            return null
        }

        let latestValue = latestTag && latestTag.updated_at ? Date.parse(latestTag.updated_at) : 0
        let currentValue = currentTag && currentTag.updated_at ? Date.parse(currentTag.updated_at) : 0
        let versionToMatchAgainst

        switch (true) {
            case latestValue > currentValue:
                versionToMatchAgainst = latestTag
                break
            case latestValue < currentValue:
                versionToMatchAgainst = currentTag
                break
        }

        if(!versionToMatchAgainst) {
            console.log(`No versions to match against`)

            return null
        }

        const matches = versionToMatchAgainst.tag_name.match(/^([0-9]+).([0-9]+).([0-9]+)(?:-beta-\S+.([0-9]+))?/)

        if(!matches) {
            console.log(`No matches found in version`)
            console.log(versionToMatchAgainst)

            return null
        }

        let majorInt = parseInt(matches[1])
        let minorInt = parseInt(matches[2])
        let patchInt = parseInt(matches[3])
        let prereleaseInt = matches[4] ? parseInt(matches[4]) : null
        let newVersion = null

        switch (formData.type) {
            case 'major':
                majorInt++
                newVersion = `${majorInt}.0.0`
                break
            case 'minor':
                minorInt++
                newVersion = `${majorInt}.${minorInt}.0`
                break
            case 'patch':
                patchInt++
                newVersion = `${majorInt}.${minorInt}.${patchInt}`
                break
            case 'prerelease':
                prereleaseInt = prereleaseInt !== null && tags.current?.tag_name.includes(formData.identifier) ? (prereleaseInt + 1) : 0

                if(currentValue < latestValue) {
                    patchInt++
                }

                newVersion = `${majorInt}.${minorInt}.${patchInt}-beta-${formData.identifier}.${prereleaseInt}`
                break
        }

        return newVersion
    }

    return (
        <Box>
            <Box
                component='form'
                sx={{
                    marginTop: 3,
                    marginBottom: 5,
                    display: 'flex'
                }}
            >
                <FormControl
                    variant='filled'
                    sx={{
                        width: '250px !important',
                        paddingRight: '5px'
                    }}
                >
                    <InputLabel id="release-type">Release Type</InputLabel>
                    <Select
                        labelId='release-type'
                        defaultValue='prerelease'
                        variant='filled'
                        onChange={event => setFormData({ ...formData, type: event.target.value })}
                    >
                        <MenuItem title='Prerelease' value='prerelease'>Prerelease</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label='Identifier'
                        variant='filled'
                        fullWidth
                        autoComplete='off'
                        onChange={event => setFormData({ ...formData, identifier: event.target.value })}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position='start'>x.x.x-beta-</InputAdornment>,
                                endAdornment: <InputAdornment position='start'>.x</InputAdornment>
                            }
                        }}
                    />
                </FormControl>
            </Box>
            <BranchTable
                repos={repos || []}
                loadingRepos={repos === null}
                selectedRepos={selectedRepos}
                aip={isSubmitting}
                setSelectedRepos={props.setSelectedRepos}
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
                    disabled={selectedRepos.length === 0 || formData.type === '' || (formData.type === 'prerelease' && formData.identifier === '')}
                    onClick={submit}
                    type="button"
                >Submit</LoadingButton>
            </div>
        </Box>
    )
}
