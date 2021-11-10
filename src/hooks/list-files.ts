import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { useEffect, useState } from 'react'
import { getFiles } from '../utilities/git-api/pulls/get-files'

export const useListFiles = (owner: string, repo: string, number: number) => {
    const [files, setFiles] = useState<null|RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"]>(null)

    useEffect(() => {
        setFiles(null)

        const get = async () => {
            const response = await getFiles(owner, repo, number)

            if(response) {
                setFiles(response)
            }
        }

        get()
    }, [owner, repo, number])

    return files
}
