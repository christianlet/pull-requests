import { useEffect, useState } from 'react'
import { getUsers } from '../utilities/git-api/users/get-users'

export const useAuthorsHook = () => {
    const [authors, setAuthors] = useState<null|{ username: string, name?: string }[]>([])

    useEffect(() => {
        setAuthors(null)

        const fetch = async () => {
            const users = await getUsers()

            setAuthors(users)
        }

        fetch()
    }, [])


    return authors
}