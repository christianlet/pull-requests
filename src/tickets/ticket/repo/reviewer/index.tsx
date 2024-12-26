import { ChangeCircle, CheckCircle } from '@mui/icons-material'
import { Avatar, Badge, Tooltip } from '@mui/material'
import { styled } from '@mui/system'
import { Reviewer as ReviewerType } from '../../../../types/api-types'

interface ReviewerProps {
    data: ReviewerType
}

const fromNow = (date: string) => {
    const now = new Date();
    const submittedAt = new Date(date);
    const diff = Math.abs(now.getTime() - submittedAt.getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`

    return `${days} days ago`;
}

export const Reviewer = (props: ReviewerProps) => {
    const reviewState = props.data.state.toLowerCase().replace(/(-|_)/, ' ')
    const time = fromNow(props.data.submitted_at ?? '')
    const name = props.data.user.login

    return (
        <Tooltip
            key={props.data.id}
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
                            props.data.state === "APPROVED" && (
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
                            props.data.state === "CHANGES_REQUESTED" && (
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
                    src={props.data.user.avatar_url}
                    sx={{ width: 24, height: 24, border: 'solid thin rgba(0,0,0,.2)' }}
                />
            </Badge>
        </Tooltip>
    )
}

const SmallAvatar = styled(Avatar)(() => ({
    width: 16,
    height: 16,
    border: `1px solid white`,
}));