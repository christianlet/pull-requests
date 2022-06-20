import { BaseRequest } from './BaseRequest'


export class UserRequest extends BaseRequest {
    public async userInfo(login: string) {
        const { data } = await this.api.users.getByUsername({
            username: login
        })

        return data
    }
}
