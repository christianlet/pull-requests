import { Launch, MoreHoriz } from '@mui/icons-material'
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import { useState } from 'react'
import './styles.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeMerge, faCodePullRequest, faCopy, faFileText, faTimesCircle, faUserClock } from '@fortawesome/free-solid-svg-icons'
import { TicketsState } from '../../types/api-types'
import { useAppDispatch } from '../../hooks/redux-hooks'
import { update } from '../../redux/reducers/peer-reviews-reducer'
import { requestDevBranch } from '../../utilities/git-api/pulls/request-reviewer'
import { Repo } from './repo'
import { useNavigate } from 'react-router-dom'

interface TicketProps {
    ticket: TicketsState['info']
    data: TicketsState["repos"]
    prType: string
}

export const Ticket = (props: TicketProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const menuOpen = Boolean(anchorEl)
    const navigate = useNavigate()
    const updated = new Date(props.data[0].updated_at)
    const relativeTime = getRelativeTime(updated)
    const authorData = props.data[0].user
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const myPR = true
    const jiraLink = props.ticket.link
    const devBranchManager = import.meta.env.VITE_DEV_BRANCH_MANAGER
    const devBranchRequested = props.data.filter(repo =>
        (repo.requested_reviewers?.filter(reviewer => reviewer.login === devBranchManager) ?? []).length > 0
    ).length > 0

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => (
        setAnchorEl(event.currentTarget)
    )
    const handleMenuClose = () => setAnchorEl(null)

    const devBranch = async () => {
        handleMenuClose()

        for (const repo of props.data) {
            const response = await requestDevBranch(repo.base.repo.owner.login, repo.base.repo.name, repo.number)

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

    const navigateToPage = (tab: string) => {
        const params = new URLSearchParams({
            tab
        })

        navigate(props.data[0].head.ref + `?${params.toString()}`)
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
                        >{props.ticket.number}</Typography>
                        {
                            jiraLink && (
                                <IconButton
                                    onClick={() =>
                                        window.open(
                                            jiraLink,
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
                        {relativeTime} by {authorData?.name || authorData?.login}
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
                                onClick={() => navigateToPage('description')}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faFileText} />
                                </ListItemIcon>
                                <ListItemText>Update PR Description</ListItemText>
                            </MenuItem>
                        )
                    }
                    <MenuItem
                        onClick={() => navigateToPage('base-branch')}
                        divider={true}
                    >
                        <ListItemIcon>
                            <FontAwesomeIcon icon={faCodePullRequest} />
                        </ListItemIcon>
                        <ListItemText>Update Target Branch</ListItemText>
                    </MenuItem>
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => {
                                    let text = `:alert: Hey team, ${props.ticket.link} is ready for review\n\nPRs:\n`

                                    text += props.data.map(pr => `- ${pr.html_url}`).join('\n')
                                    text += '\n\ncc: @sarmad.ansari @matthew.bentley @rich.trunzo'

                                    navigator.clipboard.writeText(text)

                                    handleMenuClose()
                                }}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faCopy} />
                                </ListItemIcon>
                                <ListItemText>Copy For Team Review</ListItemText>
                            </MenuItem>
                        )
                    }
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => navigateToPage('merge')}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faCodeMerge} />
                                </ListItemIcon>
                                <ListItemText>Merge PRs</ListItemText>
                            </MenuItem>
                        )
                    }
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => navigateToPage('close')}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                </ListItemIcon>
                                <ListItemText>Close Branches</ListItemText>
                            </MenuItem>
                        )
                    }
                    {
                        myPR && !devBranchRequested && import.meta.env['VITE_DEV_BRANCH_MANAGER'] &&(
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

const getRelativeTime = (date: Date) => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    let interval = Math.floor(seconds / 31536000)

    if (interval > 1) {
        return `${interval} years ago`
    }

    interval = Math.floor(seconds / 2592000)

    if (interval > 1) {
        return `${interval} months ago`
    }

    interval = Math.floor(seconds / 86400)

    if (interval > 1) {
        return `${interval} days ago`
    }

    interval = Math.floor(seconds / 3600)

    if (interval > 1) {
        return `${interval} hours ago`
    }

    interval = Math.floor(seconds / 60)

    if (interval > 1) {
        return `${interval} minutes ago`
    }

    return `${Math.floor(seconds)} seconds ago`
}