import { ChangeCircle, CheckCircle, Error, Launch, MergeType, MergeTypeRounded } from '@mui/icons-material'
import { Avatar, Badge, Chip, Fab, Tooltip, Typography } from '@mui/material'
import { Box, styled } from '@mui/system'
import './styles.scss'

export const Ticket = (props: any) => {
    const SmallAvatar = styled(Avatar)(() => ({
        width: 16,
        height: 16,
        border: `1px solid white`,
    }));

    return (
        <div className="ticket-container">
            <Box className="header">
                <Typography className="title">{props.title.split('/').pop()}</Typography>
            </Box>
            <div className="repo-container">
                {
                    props.data.map((ticket: any) => {
                        const approved = ticket.reviewers.filter((user: any) => user.state === 'APPROVED').length >= 2
                        const validBaseBranch = ticket.branches.base.match(/^(collab)/)

                        return (
                            <div
                                className="list-item"
                                key={ticket.id}
                            >
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <Typography className="repo-name">
                                            {ticket.repo}
                                        </Typography>
                                        <Launch
                                            className="icon"
                                            onClick={() => {
                                                window.open(ticket.pull_request.html_url, '_blank')
                                            }}
                                        />
                                    </div>
                                    {
                                        approved && ticket.mergeable && (
                                            <Chip
                                                label={ticket.branches.base}
                                                size="small"
                                                color={validBaseBranch ? 'success' : 'error'}
                                                icon={
                                                    !validBaseBranch ? (
                                                        <Tooltip
                                                            title="Cannot merge to master"
                                                            arrow
                                                        >
                                                            <Error />
                                                        </Tooltip>
                                                    ) : <></>
                                                }
                                                sx={{
                                                    fontSize: 11
                                                }}
                                            />
                                        )
                                    }
                                </div>
                                <div
                                    key={ticket.id}
                                    style={{
                                        display: 'flex'
                                    }}
                                >
                                    <Box
                                        className="users"
                                    >
                                    {
                                        ticket.reviewers.map((user: any) => (
                                            <Tooltip
                                                key={user.id}
                                                arrow={true}
                                                title={`${user.name ?? user.login} - ${user.state.toLowerCase().replace(/(-|_)/, ' ')}`}
                                            >
                                                <Badge
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
                                    </Box>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}