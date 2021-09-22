import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useRateLimitHook } from '../utilities/github-api'
import './styles.scss'

const formatter = new Intl.NumberFormat(undefined, {
    style: 'percent'
})

export const RateLimit = (props: any) => {
    const [core, setCore] = useState({
        limit: 0,
        remaining: 0,
        used: 0
    })
    const [search, setSearch] = useState({
        limit: 0,
        remaining: 0,
        used: 0
    })
    const rateLimitData = useRateLimitHook()

    useEffect(() => {
        if(rateLimitData) {
            setCore(rateLimitData.core)
            setSearch(rateLimitData.search)
        }
    }, [rateLimitData])

    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
        }}>
            <div className="rate-limit-container">
                <span>Core Rate Limit</span>
                <div
                    className={`badge ${badgeColor(core.limit, core.used)}`}
                >{core.limit ? formatter.format(core.used / core.limit) : '0%'}</div>
            </div>
            <div className="rate-limit-container">
                <span>Search Rate Limit</span>
                <div
                    className={`badge ${badgeColor(search.limit, search.used)}`}
                >{core.limit ? formatter.format(search.used / search.limit) : '0%'}</div>
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
