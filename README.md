# Pull Requests

## Prerequisites

### Clone the API

```
git clone git@github.com:christianlet/pull-requests-api
```

### Build the Static API Image

Navigate to the newly cloned directory and run

```
docker build . -t pull-requests-api:1.0
```

## Getting started

### Environment Credentials

Copy the .env.local.sample file

```
cp .env.local.sample .env.local
```

Add your PAT to the `VITE_PAT` variable

```
VITE_CLIENT_ID=
VITE_CLIENT_SECRET=
VITE_PAT={{PAT_VALUE}}
VITE_AUTH_TYPE=pat
VITE_DEV_BRANCH_MANAGER=
VITE_API_URL=http://localhost:3001
```

### Startup

Install npm dependencies

```
npm i
```

Build the docker image passing the .npmrc secret file then start the container

```
docker build . --secret id=npmrc,src=$HOME/.npmrc && \
docker-compose up -d
```

## .env File

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

### Update Description

Can generate the description based on all branches found and apply it to the selected PRs

### Update Target Branch

Allows you to set all grouped pull requests target branch.

### Copy For Jira Comment

Copies the grouped pull requests to your local clipboard to be pasted to a Jira comment.

### Merge Pull Requests

Merges pull requests into the specified target branch. Only allows merge if the pull request satisfies all the repo specifications.
