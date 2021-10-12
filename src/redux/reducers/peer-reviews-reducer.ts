import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { TicketsState } from '../../tickets';
import { PullRequest } from '../../utilities/github-api';


interface PeerReviewState {
    value: null|TicketsState[]
}

const initialState: PeerReviewState = {
    value: null
}

export const peerReviewSlice = createSlice({
    name: 'peerReviews',
    initialState,
    reducers: {
        set: (state, action: PayloadAction<null|TicketsState[]>) => {
            state.value = action.payload
        },
        update: (state, action: PayloadAction<PullRequest>) => {
            if(state.value) {
                const newTickets = [...state.value].map(ticket => {
                    const index = ticket.repos.findIndex(repo => repo.id === action.payload.id)

                    if(index > -1) {
                        ticket.repos[index] = action.payload
                    }

                    return ticket
                })

                state.value = newTickets
            }
        }
    }
})

export const { set, update } = peerReviewSlice.actions

export const selectPeerReviews = (state: RootState) => state.peerReviews.value

export default peerReviewSlice.reducer