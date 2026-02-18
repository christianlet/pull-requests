import { Collection } from 'mongodb'
import { CollectionName } from '../enums/collection-name'
import { PullRequestFull } from './collections/pull-request'
import { Release } from './collections/release'
import { Team } from './collections/team'
import { User } from './collections/user'


export type CustomCollection<Name extends CollectionName> = Collection<
    Name extends CollectionName.PULL_REQUESTS
    ? PullRequestFull
    : Name extends CollectionName.USERS
    ? User
    : Name extends CollectionName.RELEASES
    ? Release
    : Team
>