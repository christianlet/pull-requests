import { OctokitClient } from '../../octokit-client'

export const createBlob = async (
    owner: string,
    repo: string,
    path: string,
    content: string
) => {
    const octo = await OctokitClient.getInstance()
    const { data: blobData } = await octo.rest.git.createBlob({
        owner,
        repo,
        content,
        encoding: 'utf-8'
    })

    return {
        path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blobData.sha
    }
}