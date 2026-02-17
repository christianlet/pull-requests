import { Express } from 'express-serve-static-core'
import { create } from './create'
import { find } from './find'
import { getAll } from './get-all'
import { update } from './update'
import { remove } from './remove'

export default (app: Express) => {
    create(app)
    find(app)
    getAll(app)
    update(app)
    remove(app)
}