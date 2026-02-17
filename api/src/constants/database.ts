
const getProcessVar = (key: string): string => {
    if(!process.env[key]) {
        throw new Error(`${key} is not set`)
    }

    return process.env[key]
}

// MongoDB connection
export const MONGO_URI = getProcessVar('MONGO_URI')
export const DATABASE_NAME = getProcessVar('DATABASE_NAME')
export const COLLECTION_PULL_REQUESTS = getProcessVar('COLLECTION_PULL_REQUESTS')