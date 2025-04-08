

export class SessionStorage<Type = unknown> {
    public constructor(
        protected storageName: string
    ) {
        if(!sessionStorage.getItem(this.storageName)) {
            sessionStorage.setItem(this.storageName, '{}')
        }
    }

    public store(key: string|number, data: Type): void {
        const storageObject = this.getAll()

        storageObject[key] = data

        sessionStorage.setItem(this.storageName, JSON.stringify(storageObject))
    }

    public get(key: string|number): Type | null {
        const storageObject = this.getAll()

        return storageObject[key]
    }

    public getAll(): Record<string|number, Type> {
        return JSON.parse(sessionStorage.getItem(this.storageName) ?? '{}')
    }

    public delete(key: string|number): void {
        const storageObject = this.getAll()

        delete storageObject[key]

        sessionStorage.setItem(this.storageName, JSON.stringify(storageObject))
    }
}
