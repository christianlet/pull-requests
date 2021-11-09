import { useEffect, useState } from 'react'
import { AuthenticatedUser } from '../types/api-types'
import { getAuthenticatedUser } from '../utilities/github-api'


export const useAuthenticatedUser = () => {
    const [user, setUser] = useState<null|AuthenticatedUser>(null)

    useEffect(() => {
        setUser(null)

        const getUser = async () => {
            const user = await getAuthenticatedUser()

            setUser(user)
        }

        getUser()
    }, [])

    return user
}
