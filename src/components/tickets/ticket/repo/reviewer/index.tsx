import { ChangeCircle, CheckCircle } from '@mui/icons-material'
import { Avatar, Badge, Tooltip } from '@mui/material'
import { styled } from '@mui/system'
import { Reviewer as ReviewerType } from '../../../../../types/api-types'
import { fromNow } from '../../../../../utilities/from-now'

interface ReviewerProps {
    data: ReviewerType
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
                                        color: 'success.main',
                                        backgroundColor: 'white'
                                    }}
                                />
                            )
                        }
                        {
                            props.data.state === "CHANGES_REQUESTED" && (
                                <ChangeCircle
                                    className="change"
                                    fontSize="small"
                                    sx={{
                                        color: 'error.main',
                                        backgroundColor: 'white'
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
                    sx={{ width: 30, height: 30, border: 'solid thin rgba(0,0,0,.2)' }}
                />
            </Badge>
        </Tooltip>
    )
}

const SmallAvatar = styled(Avatar)(() => ({
    width: 19,
    height: 19,
    border: `1px solid rgba(255, 255, 255, 0.5)`,
}));