import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PullRequest } from '../../types/api-types'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Paper, Divider, Button, Tab, Box, Switch, FormControl, InputLabel, FormControlLabel } from '@mui/material'
import { BranchTable } from '../branch-table'
import { PullRequestDescription } from '../action/pull-request-description'
import { LongPress } from '../long-press'
import { MergePRs } from '../action/merge-prs'
import { TargetBranch } from '../action/target-branch'
import { EditablePullRequest } from '../action/types/editable-pull-request'
import { useAuthenticatedUser } from '../../hooks/authenticated-user'
import { getPullRequests } from '../../utilities/git-api/pulls/get-pull-requests'

export const BranchDetail = () => {
    const navigate = useNavigate()
    const route = useParams()
    const branch = route['*'] ?? ''
    const user = useAuthenticatedUser()
    const [searchParams, setSearchParams] = useSearchParams()
    const [showClosed, setShowClosed] = useState(false)
    const [repos, setRepos] = useState<null | false | EditablePullRequest[]>([])
    const [refreshRepos, setRefreshRepos] = useState(new Date().getTime())
    const [selectedRepos, setSelectedRepos] = useState<EditablePullRequest[]>([])
    const currentTab = searchParams.get('tab') ?? 'description'

    useEffect(() => {
        if(!user) {
            return
        }

        setRepos(null)
        setSelectedRepos([])

        getPullRequests({
            q: `org:foxcorp org:foxnews org:${user.login} ${showClosed ? '' : 'is:open'} head:${branch}`
        })
            .then(data => {
                setRepos(data.items)
            })
            .catch(e => {
                console.error(e)
                setRepos(false)
            })
    }, [branch, refreshRepos, user, showClosed])

    if(!branch) {
        navigate('/prs')

        return null
    }

    return (
        <Paper style={{ margin: '25px 100px', padding: 25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'  }}>
                <div>
                    <h1>Branch Details</h1>
                </div>
                <div>
                    <FormControlLabel
                        label="Show Closed PRs"
                        control={
                            <Switch
                                id="show-switch"
                                checked={showClosed}
                                onChange={() => setShowClosed(!showClosed)}
                            />
                        }
                    />
                </div>
            </Box>
            <Divider />
            <TabContext value={currentTab}>
                <TabList onChange={
                    (e, value) => {
                        setSelectedRepos([])
                        searchParams.set('tab', value)

                        setSearchParams(searchParams)
                    }
                }>
                    <Tab label="Description" value="description" />
                    <Tab label="Merge" value="merge" />
                    <Tab label="Target Branch" value="target-branch" />
                </TabList>
                <Box>
                    <TabPanel value="description">
                        <PullRequestDescription
                            user={user}
                            branch={branch}
                            repos={repos}
                            selectedRepos={selectedRepos}
                            setRefreshRepos={setRefreshRepos}
                            setSelectedRepos={setSelectedRepos}
                        />
                    </TabPanel>
                    <TabPanel value="merge">
                        <MergePRs
                            user={user}
                            branch={branch}
                            repos={repos}
                            selectedRepos={selectedRepos}
                            setRefreshRepos={setRefreshRepos}
                            setSelectedRepos={setSelectedRepos}
                        />
                    </TabPanel>
                    <TabPanel value="target-branch">
                        <TargetBranch
                            user={user}
                            branch={branch}
                            repos={repos}
                            selectedRepos={selectedRepos}
                            setRefreshRepos={setRefreshRepos}
                            setSelectedRepos={setSelectedRepos}
                        />
                    </TabPanel>
                </Box>
            </TabContext>
        </Paper>
    )
}
