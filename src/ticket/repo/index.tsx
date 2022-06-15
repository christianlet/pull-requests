import { PullRequest } from '../../types/api-types'
import { Badge, BadgeProps, Box, Chip, IconButton, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Tooltip } from '@mui/material'
import { ArrowRightAlt, Launch } from '@mui/icons-material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch, faComment, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { styled } from '@mui/system'
import { Reviewer } from './reviewer'

interface RepoProps {
    data: PullRequest
    divider: boolean
}

export const Repo = (props: RepoProps) => {
    const ticket = props.data
    const comments = ticket.comments + ticket.review_comments
    const releaseManagerRequested = ticket.requested_reviewers?.filter(
        r => r.login === process.env.REACT_APP_DEV_BRANCH_MANAGER
    )

    return (
        <ListItem
            key={ticket.id.toString()}
            className="list-item"
            divider={props.divider}
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
                sx={{
                    alignItems: 'center'
                }}
                primary={
                    <>
                        {ticket.repo}
                        {
                            releaseManagerRequested &&
                            releaseManagerRequested.length > 0 && (
                                <Tooltip
                                    key="release-branch-manager"
                                    arrow={true}
                                    title={`Release branch manager ${process.env.REACT_APP_DEV_BRANCH_MANAGER} requested`}
                                >
                                    <FontAwesomeIcon
                                        icon={faUserShield}
                                        style={{
                                            fontSize: 16,
                                            marginLeft: 5,
                                            marginBottom: '-2px'
                                        }}
                                    />
                                </Tooltip>
                            )
                        }
                        {
                            comments > 0 && (
                                <StyledBadge
                                    badgeContent={ticket.comments + ticket.review_comments}
                                    sx={{
                                        marginRight: 1
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faComment}
                                        style={{
                                            fontSize: 16,
                                            marginLeft: 5
                                        }}
                                    />
                                </StyledBadge>
                            )
                        }
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
                        title="Base branch"
                        sx={{
                            color: 'text.primary'
                        }}
                    >
                        {
                            !ticket.merged ? (
                                <ArrowRightAlt />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faCodeBranch}
                                    transform={{
                                        rotate: 180
                                    }}
                                    style={{
                                        marginRight: 5
                                    }}
                                />
                            )
                        }
                        <span>{ticket.branches?.base}</span>
                    </Box>
                }
                secondaryTypographyProps={{
                    fontSize: '11px'
                }}
            />
            <ListItemAvatar sx={{ textAlign: 'right' }}>
            {
                ticket.reviewers.map(reviewer => (
                    <Reviewer
                        key={reviewer.id}
                        data={reviewer}
                    />
                ))
            }
            </ListItemAvatar>
        </ListItem>
    )
}

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: '50%',
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
      backgroundColor: theme.palette.mode === 'dark' ? 'gray' : 'lightgray'
    },
}));