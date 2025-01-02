/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Typography } from '@mui/material'
import { Release } from '../../../types/releases/release'
import { useEffect, useState } from 'react'
import { stepChecks } from '../functions/step-checks'

interface StepProps extends Release {
    step: keyof Release['steps']
}

export const Step = ({ step, ...props }: StepProps) => {
    const stepData = props.steps[step]
    const scheduledAtDate = stepData.scheduledAt ? new Date(stepData.scheduledAt).getTime() : null
    const todaysDate = new Date().getTime()
    const relativeDate = scheduledAtDate ? Math.floor((scheduledAtDate - todaysDate) / (1000 * 60 * 60 * 24)) : 0
    const [stepIsReady, setStepIsReady] = useState<null|{ready: boolean; message: string[]}>(null)
    const checkStepStatus = async () => {
        if(stepData.status === 'completed' || stepData.status === 'skipped') {
            return
        }

        const check = stepChecks(step, props)

        setStepIsReady(check)
    }

    useEffect(() => {
        checkStepStatus()
    }, [])

    return (
        <Box sx={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            margin: '1px',
            padding: '10px'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="body1">{stepData.label}</Typography>
                    <Typography
                        variant="body1"
                        color={stepData.scheduledAt !== '' ? 'textPrimary' : 'textDisabled'}
                    >
                        {stepData.scheduledAt ? new Date(stepData.scheduledAt).toLocaleDateString() : 'Not scheduled'}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">{relativeDate ? `In ${relativeDate} day${relativeDate > 1 ? 's' : ''}` : ''}</Typography>
                    {
                        stepIsReady !== null && (
                            <Typography
                                variant="body1"
                                color={stepIsReady.ready ? 'success' : 'error'}
                            >{stepIsReady.ready ? 'Ready' : 'Not Ready'}</Typography>
                        )
                    }
                </Box>
            </Box>
            <Box sx={{ padding: '10px' }}>
                <ul>
                    {
                        stepIsReady?.message.map((message, index) => (
                            <li>
                                <Typography key={index} variant="body2">{message}</Typography>
                            </li>
                        ))
                    }
                </ul>
            </Box>
        </Box>
    )
}


