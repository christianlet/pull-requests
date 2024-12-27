import { useEffect, useState } from 'react'
import { useAppSelector } from './redux-hooks'
import { OctokitClient } from '../utilities/octokit-client'

export const useRateLimitHook = (refresh: number = 0) => {
    const token = useAppSelector(state => state.token.value)

    const [data, setData] = useState<{
        core: {
            limit: number
            remaining: number
            reset: number
            used: number
        }
        search: {
            limit: number;
            remaining: number;
            reset: number;
            used: number;
        }
    }>({
        core: {
            limit: 0,
            remaining: 0,
            reset: 0,
            used: 0,
        },
        search: {
            limit: 0,
            remaining: 0,
            reset: 0,
            used: 0,
        }
    })

    useEffect(() => {
        const getRateLimit = async () => {
            if(token) {
                const octokit = await OctokitClient.getInstance()
                const { data } = await octokit.rateLimit.get()

                setData(data.resources)
            }
        }

        getRateLimit()
    }, [refresh, token])

    return data
}