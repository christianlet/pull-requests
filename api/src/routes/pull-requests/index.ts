import { Router } from 'express'
import { create } from './create'
import { find } from './find'
import { remove } from './remove'
import { search } from './search'
import { update } from './update'

export const pullRequestRouter = Router()

pullRequestRouter.post('/', create)
pullRequestRouter.get('/', search)
pullRequestRouter.get('/:id', find)
pullRequestRouter.put('/:id', update)
pullRequestRouter.delete('/:id', remove)
