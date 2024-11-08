import { Launch, MoreHoriz } from '@mui/icons-material'
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import { useState } from 'react'
import moment from 'moment'
import './styles.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faProjectDiagram, faTimesCircle, faUserClock, faWrench } from '@fortawesome/free-solid-svg-icons'
import { TicketsState } from '../../types/api-types'
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks'
import { update } from '../../redux/reducers/peer-reviews-reducer'
import { requestDevBranch } from '../../utilities/git-api/pulls/request-reviewer'
import { Repo } from './repo'

const jiraLinkRegex = /(CPENY|LANDO|SPARK|CMS[A-Z0-9]+)-[0-9]+/g

interface TicketProps {
    title: string
    data: TicketsState["repos"]
    openTicketDetail: (action: string) => void
    prType: string
}

export const Ticket = (props: TicketProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const menuOpen = Boolean(anchorEl)
    const updated = moment(props.data[props.data.length-1].updated_at)
    const authorData = props.data[props.data.length-1].user
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const user = useAppSelector(state => state.user.value)
    const myPR = user?.login === props.data[0]?.user.login
    const jiraLink = props.title.toUpperCase().match(jiraLinkRegex)?.pop()
    const devBranchManager = process.env.REACT_APP_DEV_BRANCH_MANAGER
    const devBranchRequested = props.data.filter(repo =>
        (repo.requested_reviewers?.filter(reviewer => reviewer.login === devBranchManager) ?? []).length > 0
    ).length > 0

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => (
        setAnchorEl(event.currentTarget)
    )
    const handleMenuClose = () => setAnchorEl(null)

    const openTicketDialog = (action: string) => {
        handleMenuClose()
        props.openTicketDetail(action)
    }

    const devBranch = async () => {
        handleMenuClose()

        for (const repo of props.data) {
            const response = await requestDevBranch(repo.owner, repo.repo, repo.number)

            if(response) {
                dispatch(
                    update({
                        ...repo,
                        requested_reviewers: response
                    })
                )
            }
        }
    }

    return (
        <Box
            className="ticket-container"
        >
            <Box
                className="header"
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                    color: 'text.primary'
                }}
            >
                <div>
                    <Box
                        display="flex"
                        alignItems="center"
                    >
                        <Typography
                            className="title"
                            sx={{
                                color: 'text.secondary'
                            }}
                        >{props.title}</Typography>
                        {
                            jiraLink && (
                                <IconButton
                                    onClick={() =>
                                        window.open(
                                            `https://teamfox.atlassian.net/browse/${jiraLink}`,
                                            '_blank'
                                        )
                                    }
                                    size="small"
                                    sx={{
                                        color: 'text.primary'
                                    }}
                                >
                                    <Launch fontSize="small" />
                                </IconButton>
                            )
                        }
                    </Box>
                    <Typography
                        className="subtitle"
                        sx={{
                            color: 'text.disabled'
                        }}
                    >
                        {updated.fromNow()} by {authorData.name ?? authorData.login}
                    </Typography>
                </div>
                <IconButton
                    onClick={handleMenuClick}
                    color="inherit"
                >
                    <MoreHoriz fontSize="small" />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    sx={{
                        width: 300
                    }}
                >
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => openTicketDialog('delete')}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                </ListItemIcon>
                                <ListItemText>Close Branches</ListItemText>
                            </MenuItem>
                        )
                    }
                    <MenuItem
                        onClick={() => openTicketDialog('dev-branch')}
                        divider={true}
                    >
                        <ListItemIcon>
                            <FontAwesomeIcon icon={faWrench} />
                        </ListItemIcon>
                        <ListItemText>Update Target Branch</ListItemText>
                    </MenuItem>
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => {
                                    const items = props.data.map(pr => `- ${pr.html_url}`)

                                    navigator.clipboard.writeText(items.join("\n"))

                                    handleMenuClose()
                                }}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faCopy} />
                                </ListItemIcon>
                                <ListItemText>Copy For Jira Comment</ListItemText>
                            </MenuItem>
                        )
                    }
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => openTicketDialog('merge-prs')}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faProjectDiagram} />
                                </ListItemIcon>
                                <ListItemText>Merge PRs</ListItemText>
                            </MenuItem>
                        )
                    }
                    {
                        myPR && !devBranchRequested && process.env['REACT_APP_DEV_BRANCH_MANAGER'] &&(
                            <MenuItem
                                onClick={() => devBranch()}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faUserClock} />
                                </ListItemIcon>
                                <ListItemText>Request Target Branch</ListItemText>
                            </MenuItem>
                        )
                    }
                </Menu>
            </Box>
            <Divider />
            <Box
                className="repo-container"
                sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderColor: 'divider',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderTopWidth: 0,
                }}
            >
                {
                    props.data.map((ticket, i) => {
                        return (
                            <Repo
                                key={ticket.id}
                                data={ticket}
                                divider={i < (props.data.length - 1)}
                            />
                        )
                    })
                }
            </Box>
        </Box>
    )
}