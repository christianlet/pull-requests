import { Octokit } from '@octokit/rest';

export interface Authorization {
    generate(): Promise<Octokit>
}