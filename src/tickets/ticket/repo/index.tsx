import { PullRequestFull } from '../../../types/api-types'
import { Box, Button, IconButton, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Tooltip } from '@mui/material'
import { Launch } from '@mui/icons-material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeMerge, faCodePullRequest, faComment, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { Reviewer } from './reviewer'

interface RepoProps {
    data: PullRequestFull
    divider: boolean
}

export const Repo = (props: RepoProps) => {
    const ticket = props.data
    const comments = ticket.comments + ticket.review_comments
    const releaseManagerRequested = ticket.requested_reviewers?.filter(
        r => r.login === import.meta.env.VITE_DEV_BRANCH_MANAGER
    )

    return (
        <ListItem
            key={ticket.id.toString()}
            className="list-item"
            divider={props.divider}
            dense={true}
            sx={{
                borderLeft: '5px solid',
                borderLeftColor: ticket.mergeable_state === 'dirty' ? 'error.main' : 'transparent',
            }}
        >
            <ListItemIcon>
                <IconButton
                    onClick={() => window.open(ticket.html_url, '_blank')}
                    size="small"
                    sx={{
                        color: 'text.primary',
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
                        <Box>
                            {ticket.base.repo.name}
                        </Box>
                        {
                            releaseManagerRequested &&
                            releaseManagerRequested.length > 0 && (
                                <Tooltip
                                    key="release-branch-manager"
                                    arrow={true}
                                    title={`Release branch manager ${import.meta.env.VITE_DEV_BRANCH_MANAGER} requested`}
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
                                <FontAwesomeIcon
                                    icon={faCodePullRequest}
                                    style={{
                                        marginRight: 5,
                                        marginLeft: 10
                                    }}
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faCodeMerge}
                                    style={{
                                        marginRight: 5
                                    }}
                                />
                            )
                        }
                        <span>{ticket.base.ref}</span>
                    </Box>
                }
                secondaryTypographyProps={{
                    component: 'div',
                    fontSize: '11px'
                }}
            />
            <ListItemAvatar sx={{ textAlign: 'right' }}>
                {
                    ticket.draft && (
                        <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                        >
                            Draft
                        </Button>
                    )
                }
                {
                    comments > 0 && (
                        <FontAwesomeIcon
                            icon={faComment}
                            size="lg"
                        />
                    )
                }
                {
                    !ticket.draft && ticket.reviewers.map(reviewer => (
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