import { Router } from 'express'
import { create } from './create'
import { find } from './find'
import { remove } from './remove'
import { search } from './search'
import { update } from './update'

export const releasesRouter = Router()

releasesRouter.post('/', create)
releasesRouter.get('/', search)
releasesRouter.get('/:id', find)
releasesRouter.put('/:id', update)
releasesRouter.delete('/:id', remove)