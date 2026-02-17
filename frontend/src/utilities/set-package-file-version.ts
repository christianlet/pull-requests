import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'
import { getBranch } from './git-api/branches/get-branch'
import { createBlob } from './git-api/commits/createBlob'
import { createCommit } from './git-api/commits/createCommit'

export class UpdatePackageVersion {
    public constructor(
        protected owner: string,
        protected repo: string,
        protected branch: string,
        protected version: string
    ) {}

    public async run(octo: Octokit) {
        const branch = await getBranch(this.owner, this.repo, this.branch)

        if(!branch) {
            return null
        }

        const blobs: RestEndpointMethodTypes['git']['createTree']['parameters']['tree'] = []
        const packageFile = await this.updatePackageJson(octo)

        if(!packageFile) {
            return null
        }

        blobs.push(packageFile)

        const packageLockFile = await this.updatePackageLockJson(octo)

        if(packageLockFile) {
            blobs.push(packageLockFile)
        }

        const response = await createCommit(
            this.owner,
            this.repo,
            branch,
            blobs,
            `Set package json files to ${this.version}`
        )

        return response
    }

    private async updatePackageJson(octo: Octokit) {
        const file = await this.getFile(octo, 'package.json').catch(() => null)

        if(!file) {
            return null
        }

        const unblobbed = atob(file.content)
        const parsed = JSON.parse(unblobbed)

        if('version' in parsed) {
            if(parsed.version === this.version) {
                return null
            }

            parsed.version = this.version
        }

        return createBlob(this.owner, this.repo, file.path, JSON.stringify(parsed, undefined, 2) + '\n')
    }

    private async updatePackageLockJson(octo: Octokit) {
        const file = await this.getFile(octo, 'package-lock.json').catch(() => null)

        if(!file) {
            return null
        }

        const unblobbed = atob(file.content)
        const parsed = JSON.parse(unblobbed)

        if('version' in parsed) {
            parsed.version = this.version
        }

        if('packages' in parsed) {
            if('' in parsed.packages) {
                parsed.packages[''].version = this.version
            }
        }

        return createBlob(this.owner, this.repo, file.path, JSON.stringify(parsed, undefined, 2) + '\n')
    }

    private async getFile(octo: Octokit, file: string) {
        const { data } = await octo.repos.getContent({
            repo: this.repo,
            owner: this.owner,
            path: file,
            ref: this.branch
        }).catch(e => ({ data: null }))

        if(!data || Array.isArray(data) || !('content' in data)) {
            return null
        }

        return data
    }
}
