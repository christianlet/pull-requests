import { LoadingButton } from '@mui/lab'
import { useState } from 'react'
import { LongPressEventType, useLongPress } from 'use-long-press'

interface LongPressProps {
    disabled: boolean
    loading: boolean
    onSubmit: () => void
}

export const LongPress = (props: LongPressProps) => {
    const [longPressInProgress, setLongPressInProgress] = useState(false)
    const longPress = useLongPress(props.onSubmit, {
        onStart: () => setLongPressInProgress(true),
        onFinish: () => setLongPressInProgress(false),
        onCancel: () => setLongPressInProgress(false),
        threshold: 3000,
        captureEvent: true,
        cancelOnMovement: true,
        detect: LongPressEventType.Pointer
    })

    return (
        <LoadingButton
            className={longPressInProgress ? 'pressing' : ''}
            variant="contained"
            color="info"
            loading={props.loading}
            size="large"
            disabled={props.disabled}
            disableRipple={true}
            {...longPress()}
            sx={{
                minWidth: '200px'
            }}
        >Submit</LoadingButton>
    )
}
