import { ArrowRightAlt, ChangeCircle, CheckCircle, Close, Code, CompareArrows, Launch, MoreHoriz } from '@mui/icons-material'
import { Avatar, Badge, IconButton, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { Box, styled } from '@mui/system'
import { useState } from 'react'
import moment from 'moment'
import { PullRequest } from '../utilities/github-api'
import './styles.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTerminal, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

interface TicketProps {
    title: string
    data: PullRequest[]
    openTicketDetail: (action: string) => void
    prType: string
}

export const Ticket = (props: TicketProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const menuOpen = Boolean(anchorEl)
    const created = moment(props.data[props.data.length-1].created_at)
    const authorData = props.data[props.data.length-1].user
    const SmallAvatar = styled(Avatar)(() => ({
        width: 16,
        height: 16,
        border: `1px solid white`,
    }));

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => (
        setAnchorEl(event.currentTarget)
    )
    const handleMenuClose = () => setAnchorEl(null)

    const openTicketDialog = (action: string) => {
        handleMenuClose()
        props.openTicketDetail(action)
    }

    return (
        <div className="ticket-container">
            <Box className="header">
                <div>
                    <Typography className="title">{props.title}</Typography>
                    <Typography className="subtitle">
                        {created.fromNow()} by {authorData.name ?? authorData.login}
                    </Typography>
                </div>
                <IconButton
                    onClick={handleMenuClick}
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
                        props.prType === 'created' && (
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
                    {
                        props.prType === 'created' && (
                            <MenuItem
                                onClick={() => openTicketDialog('dev-branch')}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faTerminal} />
                                </ListItemIcon>
                                <ListItemText>Update Base Branch</ListItemText>
                            </MenuItem>
                        )
                    }
                    <MenuItem
                        onClick={() => openTicketDialog('diff')}
                    >
                        <ListItemIcon>
                            <CompareArrows />
                        </ListItemIcon>
                        <ListItemText>Diff Tool</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
            <div className="repo-container">
                {
                    props.data.map(ticket => {
                        const approved = ticket.reviewers.filter(user => user.state === 'APPROVED').length >= 2
                        const validBaseBranch = ticket.branches.base.match(/^(collab)/)

                        return (
                                <ListItem
                                    key={ticket.id.toString()}
                                    className="list-item"
                                    divider={true}
                                    dense={true}
                                >
                                    <ListItemIcon>
                                        <IconButton
                                            onClick={() => window.open(ticket.pull_request.html_url, '_blank')}
                                            size="small"
                                        >
                                            <Launch fontSize="small" />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={ticket.repo}
                                        secondary={
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                padding="0"
                                                marginTop="-5px"
                                                title="Base branch"
                                            >
                                                <ArrowRightAlt />
                                                <p>{ticket.branches.base}</p>
                                            </Box>
                                        }
                                        secondaryTypographyProps={{
                                            fontSize: '11px'
                                        }}
                                    />
                                    <ListItemAvatar sx={{ textAlign: 'right' }}>
                                    {
                                            ticket.reviewers.map(user => (
                                                <Tooltip
                                                    key={user.id}
                                                    arrow={true}
                                                    title={`${user.name ?? user.login} - ${user.state.toLowerCase().replace(/(-|_)/, ' ')}`}
                                                >
                                                    <Badge
                                                        sx={{ marginLeft: '5px' }}
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        badgeContent={
                                                            <SmallAvatar>
                                                                {
                                                                    user.state === "APPROVED" && (
                                                                        <CheckCircle
                                                                            className="user-badge approved"
                                                                            fontSize="small"
                                                                        />
                                                                    )
                                                                }
                                                                {
                                                                    user.state === "CHANGES_REQUESTED" && (
                                                                        <ChangeCircle
                                                                            className="user-badge change"
                                                                            fontSize="small"
                                                                        />
                                                                    )
                                                                }
                                                            </SmallAvatar>
                                                        }
                                                    >
                                                        <Avatar
                                                            alt={user.name ?? user.login}
                                                            src={user.avatar_url}
                                                            sx={{ width: 24, height: 24, border: 'solid thin rgba(0,0,0,.2)' }}
                                                        />
                                                    </Badge>
                                                </Tooltip>
                                            ))
                                        }
                                    </ListItemAvatar>
                                </ListItem>
                        )
                    })
                }
            </div>
        </div>
    )
}