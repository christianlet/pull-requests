import { Router } from 'express'
import { create } from './create'
import { find } from './find'
import { getAll } from './get-all'
import { remove } from './remove'
import { update } from './update'

export const pullRequestRouter = Router()

pullRequestRouter.post('/', create)
pullRequestRouter.get('/', getAll)
pullRequestRouter.get('/:id', find)
pullRequestRouter.put('/:id', update)
pullRequestRouter.delete('/:id', remove)
