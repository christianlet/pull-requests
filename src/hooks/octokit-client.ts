import { Octokit } from '@octokit/rest'
import { useEffect, useState } from 'react'
import { OctokitClient } from '../utilities/octokit-client'

export const useOctokitClient = () => {
    const [client, setClient] = useState<null|Octokit>(null)

    useEffect(() => {
      OctokitClient.getInstance().then(c => {
        setClient(c)
      })
    }, [])

    return client
}