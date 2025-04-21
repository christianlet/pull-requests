# Pull Requests

## Prerequisites

1. Clone down `git @github.com:christianlet/pull-requests-api`
2. Navigate to the newly cloned directory and run `docker build .`

These commands build the static image for the API.

## Getting started

1. Duplicate the `.env.local.sample` file with the name `.env.local`
2. Add your PAT token to the config key `VITE_PAT`
3. Run `docker-compose up -d` to start up the application

## .env

|Key|Description|
|-|-|
|VITE_CLIENT_ID|Needed if using Oauth authentication|
|VITE_CLIENT_SECRET|Needed if using Oauth authentication|
|VITE_PAT|Needed if using PAT authentication|
|VITE_AUTH_TYPE|'pat' or 'oauth' Specifies the authentication method|
|VITE_DEV_BRANCH_MANAGER|github username of user|
|VITE_API_URL|The address of the API|

## Pull Requests

The app groups pull requests by branch name. Links to each PR in github is available. If the branch name follows the Fox naming conventions a link to the Jira ticket will be provided. The app also allows you to see teammates pull requests. Viewing other users can simply be done by using the dropdown on the upper left side.

The information display in the pull requests:
- When the PR was created
- The branch it is targeting
- The peer reviews it receives, it shows:
  - Approvals
  - Changes requested
  - Comments
  - Merge conflicts

## Actions

When you are viewing pull requests you have created, you have access to actions that can be run.

### Update Target Branch

Allows you to set all grouped pull requests target branch.

### Copy For Jira Comment

Copies the grouped pull requests to your local clipboard to be pasted to a Jira comment.

### Merge Pull Requests

Merges pull requests into the specified target branch. Only allows merge if the pull request satisfies all the repo specifications.
