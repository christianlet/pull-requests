import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './redux/reducers/token-reducer';
import peerReviewsReducer from './redux/reducers/peer-reviews-reducer';
import userReducer from './redux/reducers/user-reducer';

export const store = configureStore({
    reducer: {
        peerReviews: peerReviewsReducer,
        user: userReducer,
        token: tokenReducer
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch