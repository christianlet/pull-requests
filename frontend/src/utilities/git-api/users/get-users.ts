
import { ApiClient } from '../../../clients/ApiClient'
import { User } from '../../../types/api-types'

export const getUsers = async () => {
    const client = ApiClient.getInstance()
    const response = await client.request<{ items: User[] }>('/github/users')
    const users = response.items.map(item => ({
        ...item,
        username: item.login,
        name: item.name || item.login
    }))

    return users.sort(
        (a, b) => (a.name.toLowerCase() > b.name.toLowerCase())
            ? 1
            : (
                (b.name.toLowerCase() > a.name.toLowerCase())
                    ? -1
                    : 0
            )
    )
}