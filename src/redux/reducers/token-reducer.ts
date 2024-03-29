import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface tokenState {
    value: null|string
}

const initialState: tokenState = {
    value: null
}

export const tokenSlice = createSlice({
    name: 'token',
    initialState,
    reducers: {
        set: (
            state,
            action: PayloadAction<null|string>
        ) => {
            state.value = action.payload
        }
    }
})

export const { set } = tokenSlice.actions

export const selectToken = (state: RootState) => state.token.value

export default tokenSlice.reducer