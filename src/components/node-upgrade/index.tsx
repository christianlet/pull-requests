

import { Settings, Upgrade, Work } from '@mui/icons-material'
import { Box, Button, Chip, CircularProgress, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'
import { useEffect, useState } from 'react'
import { parse, parseDocument, stringify } from 'yaml'
import { useOctokitClient } from '../../hooks/octokit-client'
import { createBranch } from '../../utilities/git-api/branches/create-branch'
import { createBlob } from '../../utilities/git-api/commits/createBlob'
import { createCommit } from '../../utilities/git-api/commits/createCommit'

interface Repos {
    total: number
    items: {
        url: string
        fullName: string
        owner: string
        repo: string
        defaultRef: string
        defaultNodeVersionInConfig: null | string
        defaultNodeVersionInFiles: {
            [index: string]: string
        }
        nodeVersionInConfig?: null | string
        nodeVersionInFiles?: {
            [index: string]: string
        }
    }[]
}

const repoPrefixes = [
    'lib-fox-',
    'spark-',
    'mc-',
    'api.',
    'mediacloud-',
]

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export function NodeUpgrade() {
    const octo = useOctokitClient()
    const [selectedRepos, setSelectedRepos] = useState<null | Repos['items'][number]>(null)
    const [aip, setAip] = useState({
        repos: false,
        upgrading: false
    })
    const [refresh, setRefresh] = useState(Date.now())
    const [updateForm, setUpdateForm] = useState({
        nodeVersion: '',
        branch: ''
    })
    const [repos, setRepos] = useState<Repos>({
        total: 0,
        items: []
    })

    const getRepos = async (client: Octokit, page = 1) => {
        const repos: Repos = {
            total: 0,
            items: []
        }

        const chunks = chunkArray(repoPrefixes, 5)

        for (const chunk of chunks) {
            const initial = await search(client, `${chunk.join(' OR ')} in:name org:foxcorp org:foxnews language:TypeScript,JavaScript`)
            const totalForChunk = initial.data.total_count

            repos.total += totalForChunk
            repos.items = repos.items.concat(
                await mapRepos(initial.data.items.map(item => ({
                    url: item.html_url,
                    fullName: item.full_name,
                    owner: item.full_name.split('/')[0],
                    repo: item.name,
                    defaultRef: item.default_branch
                })))
            )

            if(totalForChunk > 100) {
                const pages = Math.ceil(totalForChunk / 100)

                for (let i = 2; i < pages; i++) {
                    const pageResponse = await search(client, `${chunk.join(' OR ')} in:name org:foxcorp org:foxnews language:TypeScript,JavaScript`, i)

                    repos.items = repos.items.concat(
                        await mapRepos(pageResponse.data.items.map(item => ({
                            url: item.html_url,
                            fullName: item.full_name,
                            owner: item.full_name.split('/')[0],
                            repo: item.name,
                            defaultRef: item.default_branch
                        })))
                    )
                }
            }
        }

        repos.items.sort((a, b) => a.fullName.localeCompare(b.fullName))

        setRepos(repos)
    }

    const search = async (client: Octokit, q: string, page = 1) => {
        return client.search.repos({
            q,
            per_page: 100,
            page: page > 1 ? page : undefined
        })
    }

    useEffect(() => {
        if(octo) {


            setAip({
                ...aip,
                repos: true
            })

            getRepos(octo).then(async () => {
                setAip({
                    ...aip,
                    repos: false
                })
            })

        }
    }, [octo, refresh])

    const mapRepos = async (
        repos: Omit<Repos['items'][number], 'defaultNodeVersionInConfig' | 'defaultNodeVersionInFiles'>[]
    ) => {
        return Promise.all(
            repos.map(async repo => {
                const [owner, repoName] = repo.fullName.split('/')
                const defaultBranch = await getNodeVersion(owner, repoName, repo.defaultRef)
                const response: Repos['items'][number] = {
                    url: repo.url,
                    fullName: repo.fullName,
                    owner,
                    repo: repoName,
                    defaultRef: repo.defaultRef,
                    defaultNodeVersionInConfig: defaultBranch.versionInConfig,
                    defaultNodeVersionInFiles: defaultBranch.versionInFiles
                }

                if(updateForm.branch !== '' && (defaultBranch.versionInConfig || Object.keys(defaultBranch.versionInFiles).length > 0)) {
                    const updateBranch = await getNodeVersion(owner, repoName, updateForm.branch)

                    response.nodeVersionInConfig = updateBranch.versionInConfig
                    response.nodeVersionInFiles = updateBranch.versionInFiles
                }

                return response
            })
        )
    }

    const getNodeVersion = async (owner: string, repoName: string, branch: string) => {
        const versionInFiles: Repos['items'][number]['defaultNodeVersionInFiles'] = {}
        let versionInConfig = null

        const file = await getFileContents(owner, repoName, '.github/config.yml', branch)

        if(file !== null && !Array.isArray(file) && 'content' in file) {
            const fileContent = atob(file.content)
            const fileYml = parse(fileContent)

            if(fileYml && 'node_version' in fileYml) {
                versionInConfig = fileYml.node_version
            }
        }

        const files = await getFileContents(owner, repoName, '.github/workflows', branch)

        if(files !== null && Array.isArray(files)) {
            for (const file of files) {
                const fileContents = await getFileContents(owner, repoName, file.path, branch)

                if(fileContents !== null && !Array.isArray(fileContents) && 'content' in fileContents) {
                    const unblobbed = atob(fileContents.content)
                    const match = unblobbed.match(/node-version:(?:\s)(?:['"])?([0-9]{1,4}(?:\.)?(?:[0-9]{1,4})?(?:\.)?(?:[0-9]{1,4}))(?:['"])?/)

                    if(match) {
                        versionInFiles[file.name] = match[1].replace('.x', '')
                    }
                }
            }
        }

        return {
            versionInConfig,
            versionInFiles
        }
    }

    const getFileContents = async (owner: string, repo: string, file: string, branch?: string) => {
        if(!octo) {
            return null
        }

        const response = await octo.repos.getContent({
            repo,
            owner,
            path: file,
            ref: branch
        }).catch(e => ({ data: null }))

        return response.data
    }

    const updateFiles = async (index: number, repo: Repos['items'][number]) => {
        if(!octo) {
            return
        }

        setAip({
            ...aip,
            upgrading: true
        })

        try {
            const branch = await createBranch(repo.owner, repo.repo, updateForm.branch)

            if(!branch) {
                alert('Error creating branch')

                return
            }

            const files = await getFileContents(repo.owner, repo.repo, '.github/workflows', branch.ref)

            if(!files || !Array.isArray(files)) {
                return
            }

            const blobs: RestEndpointMethodTypes['git']['createTree']['parameters']['tree'] = []

            await Promise.all(files.map(async nv => {
                const refreshedInfo = await getFileContents(repo.owner, repo.repo, nv.path, branch.ref)

                if(!refreshedInfo || Array.isArray(refreshedInfo) || !('content' in refreshedInfo) || !refreshedInfo.name.includes('.yml')) {
                    return null
                }

                let text = atob(refreshedInfo.content)
                const yaml = parseDocument(text).toJS()

                for (const job of Object.keys(yaml.jobs)) {
                    if('uses' in yaml.jobs[job] && yaml.jobs[job].uses.includes('publish-npm-package.yml')) {
                        if(!('with' in yaml.jobs[job])) {
                            yaml.jobs[job].with = {}
                        }

                        yaml.jobs[job].with['node-version'] = updateForm.nodeVersion
                    } else if('with' in yaml.jobs[job] && typeof yaml.jobs[job].with === 'object' && 'node-version' in yaml.jobs[job].with) {
                        yaml.jobs[job].with['node-version'] = updateForm.nodeVersion
                    }


                    if('steps' in yaml.jobs[job]) {
                        const steps = yaml.jobs[job].steps as any[]

                        for(const step in steps) {
                            if(!('name' in steps[step]) || !('uses' in steps[step])) {
                                continue
                            }

                            if(!steps[step].uses.includes('actions/setup-node')) {
                                continue
                            }

                            const name = steps[step].name
                            const labelMatch = name.match(/(?:Setup\sNode(?:JS)?(?:\s)(?:['"])?([0-9]{1,4}(?:\.)?(?:[0-9]{1,4})?(?:\.)?(?:[0-9]{1,4}))(?:['"])?)/)

                            if(labelMatch) {
                                steps[step].name = name.replace(labelMatch[1], updateForm.nodeVersion)
                            }

                            if('with' in steps[step] && typeof steps[step].with === 'object' && 'node-version' in steps[step].with) {
                                steps[step].with['node-version'] = updateForm.nodeVersion
                            }
                        }

                        yaml.jobs[job].steps = steps
                    }
                }

                const blob = await createBlob(
                    repo.owner,
                    repo.repo,
                    refreshedInfo.path,
                    stringify(yaml, {
                        blockQuote: 'literal',
                        lineWidth: 0,
                    }).replace('pull_request: null', 'pull_request:')
                )

                blobs.push(blob)
            }))

            const packageJson = await getFileContents(repo.owner, repo.repo, 'package.json', branch.ref)
            const packageLockJson = await getFileContents(repo.owner, repo.repo, 'package-lock.json', branch.ref)

            if(packageJson && !Array.isArray(packageJson) && 'content' in packageJson && packageJson.content) {
                const unblobbed = atob(packageJson.content)
                const parsed = JSON.parse(unblobbed)
                const version = updateForm.nodeVersion.replace('.x', '')

                addEngine(parsed, version)

                const [,major, minor] = parsed.version.match(/([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3})/)

                const newPackageJsonVersion = `${major}.${parseInt(minor) + 1}.0-beta-node-upgrade.0`

                updatePackageJsonVersion(parsed, newPackageJsonVersion)

                blobs.push(
                    await createBlob(repo.owner, repo.repo, packageJson.path, JSON.stringify(parsed, undefined, 2) + '\n')
                )

                if(packageLockJson && !Array.isArray(packageLockJson) && 'content' in packageLockJson && packageLockJson.content) {
                    const unblobbed = atob(packageLockJson.content)
                    const parsed = JSON.parse(unblobbed)
                    const version = updateForm.nodeVersion.replace('.x', '')

                    updatePackageJsonVersion(parsed, newPackageJsonVersion)

                    if('packages' in parsed) {
                        if('' in parsed.packages) {
                            addEngine(parsed.packages[''], version)
                            updatePackageJsonVersion(parsed.packages[''], newPackageJsonVersion)
                        }
                    }

                    blobs.push(
                        await createBlob(repo.owner, repo.repo, packageLockJson.path, JSON.stringify(parsed, undefined, 2) + '\n')
                    )
                }
            }

            const response = await createCommit(
                repo.owner,
                repo.repo,
                branch,
                blobs,
                `Upgrade to node version ${updateForm.nodeVersion}`
            )

            if(response.status === 200) {
                await octo.pulls.create({
                    owner: repo.owner,
                    repo: repo.repo,
                    title: `Upgrade Node.js to version ${updateForm.nodeVersion}`,
                    head: branch.ref,
                    base: repo.defaultRef,
                }).catch(e => console.log(e))

                const newRepos = await Promise.all(repos.items.map(async (r, i) => {
                    if(i === index) {
                        const wrappedArray = await mapRepos([r])
                        const newRepo = wrappedArray.at(0)

                        if(newRepo) {
                            r = newRepo
                        }
                    }

                    return r
                }))

                setRepos({
                    ...repos,
                    items: newRepos
                })
            }
        } catch (error) {
            console.error(error)
        }

        setAip({
            ...aip,
            upgrading: false
        })
    }

    const addEngine = (item: Record<string, Record<string, string>>, version: string) => {
        if('engines' in item) {
            if('node' in item.engines) {
                item.engines.node = `>=${version}`
            } else {
                item.engines.node = `>=${version}`
            }
        } else {
            item.engines = {
                node: `>=${version}`
            }
        }
    }

    const updatePackageJsonVersion = (item: Record<string, string>, version: string) => {
        if('version' in item) {
            item.version = version
        }
    }

    return (
        <div>
            <Paper variant='elevation' elevation={0} sx={{ marginY: 2, padding: 2 }}>
                <Box component='form' display='flex'>
                    <TextField
                        label='Node Version'
                        defaultValue={updateForm.nodeVersion}
                        disabled={aip.repos || aip.upgrading}
                        onChange={e => setUpdateForm({ ...updateForm, nodeVersion: e.target.value })}
                    />
                    <TextField
                        label='Branch'
                        defaultValue={updateForm.branch}
                        onChange={e => setUpdateForm({ ...updateForm, branch: e.target.value })}
                        onBlur={() => setRefresh(Date.now())}
                        disabled={aip.repos || aip.upgrading}
                        sx={{ flexGrow: 1, marginX: 1 }}
                    />
                </Box>
            </Paper>
            <Stack direction='row' justifyContent='space-between' alignItems='end' marginBottom={1} marginX={2}>
                <Box>
                    <Typography sx={{ marginBottom: 1, marginTop: 5 }}>
                        Total repositories: {repos.total}
                    </Typography>
                </Box>
                <Box>
                    {
                        (aip.repos || aip.upgrading) && (
                            <>
                                <Typography sx={{ marginRight: 1, display: 'inline-block', verticalAlign: 'top' }}>
                                    Loading
                                </Typography>
                                <CircularProgress size='20px' />
                            </>
                        )
                    }
                </Box>
            </Stack>
            <TableContainer
                component={Paper}
                variant='outlined'
                sx={{ maxHeight: 600}}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Repo</TableCell>
                            <TableCell>Main Branch</TableCell>
                            {
                                updateForm.branch ? (
                                    <TableCell>{updateForm.branch} Branch</TableCell>
                                ) : <></>
                            }
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            repos.items.length === 0 && !aip.repos && (
                                <TableRow>
                                    <TableCell
                                        colSpan={updateForm.branch ? 4 : 3}
                                        align='center'
                                    >No data found</TableCell>
                                </TableRow>
                            )
                        }
                        {
                            repos.items.map((repo, i) => (
                                <TableRow key={`${repo.fullName}`}>
                                    <TableCell>
                                        <Link
                                            href={repo.url}
                                            target='_blank'
                                            rel='noreferrer'
                                            underline='none'
                                        >{repo.fullName}</Link>
                                    </TableCell>
                                    <TableCell>
                                        <GenerateVersionChips
                                            inConfig={repo.defaultNodeVersionInConfig}
                                            inFiles={repo.defaultNodeVersionInFiles}
                                        />
                                    </TableCell>
                                    {
                                        updateForm.branch && (
                                            <TableCell>
                                                <GenerateVersionChips
                                                    inConfig={repo.nodeVersionInConfig}
                                                    inFiles={repo.nodeVersionInFiles}
                                                />
                                            </TableCell>
                                        )
                                    }
                                    <TableCell>
                                        <Button
                                            variant='contained'
                                            color='success'
                                            startIcon={<Upgrade />}
                                            disabled={(!repo.defaultNodeVersionInConfig && Object.keys(repo.defaultNodeVersionInFiles).length === 0) || updateForm.branch === '' || updateForm.nodeVersion === '' || aip.upgrading || aip.repos}
                                            onClick={async () => await updateFiles(i, repo)}
                                        >
                                            Upgrade
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <ul>
            </ul>
        </div>
    )
}

const GenerateVersionChips = (
    { inConfig, inFiles }: { inConfig?: null | string, inFiles?: Record<string, string> }
) => (
    <>
        {
            inConfig
            ? (
                <Tooltip
                    title='Found in .github/config.yml'
                >
                    <Chip
                        label={inConfig}
                        variant='outlined'
                        color='primary'
                        icon={<Settings fontSize='small' sx={{ paddingLeft: .5 }} />}
                    />
                </Tooltip>
            )
            : (
                <Stack direction='row' spacing={1}>
                    {
                        Object.entries(inFiles || {}).map(([fileName, version]) => (
                            <Tooltip
                                key={fileName}
                                title={`Found in .github/workflows/${fileName}`}
                            >
                                <Chip
                                    label={version}
                                    variant='outlined'
                                    color='default'
                                    icon={<Work fontSize='small' sx={{ paddingLeft: .5 }} />}
                                />
                            </Tooltip>
                        ))
                    }
                </Stack>
            )
        }
    </>
)