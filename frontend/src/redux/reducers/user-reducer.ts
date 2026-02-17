import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { AuthenticatedUser } from '../../types/api-types';

interface UserState {
    value: null|AuthenticatedUser
}

const initialState: UserState = {
    value: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        set: (
            state,
            action: PayloadAction<null|AuthenticatedUser>
        ) => {
            state.value = action.payload
        }
    }
})

export const { set } = userSlice.actions

export const selectUser = (state: RootState) => state.user.value

export default userSlice.reducer