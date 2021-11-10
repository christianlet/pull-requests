import { ArrowRightAlt, ChangeCircle, CheckCircle, CompareArrows, Launch, MoreHoriz } from '@mui/icons-material'
import { Avatar, Badge, Chip, Divider, IconButton, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { Box, styled, useTheme } from '@mui/system'
import { useState } from 'react'
import moment from 'moment'
import './styles.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faProjectDiagram, faTimesCircle, faUserClock, faWrench } from '@fortawesome/free-solid-svg-icons'
import { TicketsState } from '../types/api-types'
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks'
import { update } from '../redux/reducers/peer-reviews-reducer'
import { requestDevBranch } from '../utilities/git-api/pulls/request-reviewer'

interface TicketProps {
    title: string
    data: TicketsState["repos"]
    openTicketDetail: (action: string) => void
    prType: string
}

export const Ticket = (props: TicketProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const menuOpen = Boolean(anchorEl)
    const created = moment(props.data[props.data.length-1].created_at)
    const authorData = props.data[props.data.length-1].user
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const user = useAppSelector(state => state.user.value)
    const myPR = user?.login === props.data[0]?.user.login
    const devBranchRequested = props.data.filter(repo =>
        (repo.requested_reviewers?.filter(reviewer => reviewer.login === 'ashleymendez') ?? []).length > 0
    ).length > 0
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
                    <Typography
                        className="title"
                        sx={{
                            color: 'text.secondary'
                        }}
                    >{props.title}</Typography>
                    <Typography
                        className="subtitle"
                        sx={{
                            color: 'text.disabled'
                        }}
                    >
                        {created.fromNow()} by {authorData.name ?? authorData.login}
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
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => openTicketDialog('dev-branch')}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faWrench} />
                                </ListItemIcon>
                                <ListItemText>Update Base Branch</ListItemText>
                            </MenuItem>
                        )
                    }
                    {
                        myPR && (
                            <MenuItem
                                onClick={() => {
                                    const items = props.data.map(pr => (`* [${pr.repo} PR|${pr.html_url}]`))

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
                        myPR && !devBranchRequested && (
                            <MenuItem
                                onClick={() => devBranch()}
                                divider={true}
                            >
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={faUserClock} />
                                </ListItemIcon>
                                <ListItemText>Request Dev Branch</ListItemText>
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
                                <ListItem
                                    key={ticket.id.toString()}
                                    className="list-item"
                                    divider={i < (props.data.length - 1)}
                                    dense={true}
                                >
                                    <ListItemIcon>
                                        <IconButton
                                            onClick={() => window.open(ticket.html_url, '_blank')}
                                            size="small"
                                            sx={{
                                                color: 'text.primary'
                                            }}
                                        >
                                            <Launch fontSize="small" />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <>
                                                {ticket.repo}
                                                {
                                                    ticket.draft && (
                                                        <Chip
                                                            label="Draft"
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            sx={{
                                                                marginLeft: '5px',
                                                                height: '18px',
                                                                fontSize: 12,
                                                                '.MuiChip-labelSmall': {
                                                                    lineHeight: 1
                                                                }
                                                            }}
                                                        />
                                                    )
                                                }
                                            </>
                                        }
                                        secondary={
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                padding="0"
                                                marginTop="-5px"
                                                title="Base branch"
                                                sx={{
                                                    color: 'text.primary'
                                                }}
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
                                            ticket.reviewers.map(review => {
                                                const reviewState = review.state.toLowerCase().replace(/(-|_)/, ' ')
                                                const name = review.user?.name ?? review.user.login
                                                const time = moment(review.submitted_at).fromNow()

                                                return (
                                                    <Tooltip
                                                        key={review.id}
                                                        arrow={true}
                                                        title={`${name} - ${reviewState} (${time})`}
                                                    >
                                                        <Badge
                                                            sx={{ marginLeft: '5px' }}
                                                            overlap="circular"
                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                            badgeContent={
                                                                <SmallAvatar>
                                                                    {
                                                                        review.state === "APPROVED" && (
                                                                            <CheckCircle
                                                                                className="user-badge approved"
                                                                                fontSize="small"
                                                                                sx={{
                                                                                    color: 'success.light'
                                                                                }}
                                                                            />
                                                                        )
                                                                    }
                                                                    {
                                                                        review.state === "CHANGES_REQUESTED" && (
                                                                            <ChangeCircle
                                                                                className="user-badge change"
                                                                                fontSize="small"
                                                                                sx={{
                                                                                    color: 'error.light'
                                                                                }}
                                                                            />
                                                                        )
                                                                    }
                                                                </SmallAvatar>
                                                            }
                                                        >
                                                            <Avatar
                                                                alt={name}
                                                                src={review.user.avatar_url}
                                                                sx={{ width: 24, height: 24, border: 'solid thin rgba(0,0,0,.2)' }}
                                                            />
                                                        </Badge>
                                                    </Tooltip>
                                                )
                                            })
                                        }
                                    </ListItemAvatar>
                                </ListItem>
                        )
                    })
                }
            </Box>
        </Box>
    )
}