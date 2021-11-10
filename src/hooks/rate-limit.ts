import { useEffect, useState } from 'react'
import { Oauth } from '../utilities/authorizations/oauth'
import { useAppSelector } from './redux-hooks'

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
                const octokit = await new Oauth(token).generate()
                const { data } = await octokit.rateLimit.get()

                setData(data.resources)
            }
        }

        getRateLimit()
    }, [refresh, token])

    return data
}