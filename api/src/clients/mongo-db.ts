import { Db, MongoClient } from 'mongodb'
import { DATABASE_NAME, MONGO_URI } from '../constants/database'
import { CollectionName } from '../enums/collection-name'
import { CustomCollection } from '../types/custom-collection'


export class MongoDb {
    private static instance: Db

    private constructor() { }

    public static getCollection<Name extends CollectionName>(name: Name): CustomCollection<Name> {
        return MongoDb.getInstance().collection(name)
    }

    private static getInstance() {
        if (!this.instance) {
            this.instance = new MongoClient(MONGO_URI).db(DATABASE_NAME)
        }

        return this.instance
    }
}
