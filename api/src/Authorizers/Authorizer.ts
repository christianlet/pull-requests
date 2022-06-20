import { Octokit } from '@octokit/rest';

export abstract class Authorizer {
    public abstract connect(): Octokit
}
