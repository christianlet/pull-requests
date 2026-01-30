import { faCodeMerge, faCodePullRequest, faComment, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Error } from '@mui/icons-material'
import { Box, Button, ListItem, ListItemAvatar, ListItemText, Tooltip, Typography } from '@mui/material'
import { PullRequestFull } from '../../../../types/api-types'
import { Reviewer } from './reviewer'
import './styles.scss'

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
        >
            <ListItemText
                sx={{
                    alignItems: 'center'
                }}
                primary={
                    <>
                        <Box>
                            <Typography
                                className="repo-name"
                                fontSize={15}
                            >
                                <a href={ticket.html_url} target="_blank">{ticket.base.repo.name}</a>
                            </Typography>
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
                            color: 'primary'
                        }}
                    >
                        {
                            !ticket.merged && ticket.mergeable_state !== 'dirty' ? (
                                <FontAwesomeIcon
                                    icon={faCodePullRequest}
                                    style={{
                                        marginRight: 5,
                                        marginLeft: 0
                                    }}
                                />
                            ) : ticket.mergeable_state === 'dirty' ? (
                                <Tooltip
                                    arrow={true}
                                    title='Merge conflict'
                                >
                                    <Error
                                        color='error'
                                        style={{
                                            fontSize: 16,
                                            marginRight: 5,
                                            marginLeft: 0
                                        }}
                                    />
                                </Tooltip>
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
                slotProps={{
                    secondary: {
                        component: 'div',
                        fontSize: '11px'
                    }
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