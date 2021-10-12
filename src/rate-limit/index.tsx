import { Tooltip } from '@mui/material'
import { Box } from '@mui/system'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useRateLimitHook } from '../utilities/github-api'
import './styles.scss'

const formatter = new Intl.NumberFormat(undefined, {
    style: 'percent'
})

export const RateLimit = (props: any) => {
    const [refreshValue, setRefreshValue] = useState(0)
    const { core, search } = useRateLimitHook(refreshValue)

    moment.relativeTimeThreshold('m', 100)
    moment.relativeTimeThreshold('ss', 0)

    useEffect(() => {
        const interval = setTimeout(() => {
            setRefreshValue(refreshValue+1)
        }, 60000)

        return () => clearInterval(interval)
    }, [refreshValue])

    return (
        <Box style={{
            display: 'flex',
            alignItems: 'flex-end'
        }}>
            <div className="rate-limit-container">
                <span>Core Rate Limit</span>
                <Tooltip
                    title={`Resets ${moment.unix(core.reset).fromNow()}`}
                >
                    <div
                        className={`badge ${badgeColor(core.limit, core.used)}`}
                    >{core.limit ? formatter.format(core.used / core.limit) : '0%'}</div>
                </Tooltip>
            </div>
            <div className="rate-limit-container">
                <span>Search Rate Limit</span>
                <Tooltip
                    title={`Resets ${moment.unix(search.reset).fromNow()}`}
                >
                    <div
                        className={`badge ${badgeColor(search.limit, search.used)}`}
                    >{core.limit ? formatter.format(search.used / search.limit) : '0%'}</div>
                </Tooltip>
            </div>
        </Box>
    )
}

const badgeColor = (limit: number, used: number) => {
    let color = 'lightgreen'

    if (limit) {
        const percentage = (used / limit) * 100

        if (percentage >= 50 && percentage < 75) {
            color = 'warning'
        } else if(percentage > 75) {
            color = 'danger'
        }
    }

    return color
}
