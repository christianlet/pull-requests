import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { OctokitClient } from '../../utilities/octokit-client'

interface octokitState {
    value: null|OctokitClient
}

const initialState: octokitState = {
    value: null
}

export const octokitSlice = createSlice({
    name: 'octokit',
    initialState,
    reducers: {
        set: (
            state,
            action: PayloadAction<null|OctokitClient>
        ) => {
            state.value = action.payload
        }
    }
})

export const { set } = octokitSlice.actions

export const selectOctokit = (state: RootState) => state.octokit.value

export default octokitSlice.reducer