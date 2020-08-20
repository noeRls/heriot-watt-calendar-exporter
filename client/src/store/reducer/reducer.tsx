import { createSlice } from '@reduxjs/toolkit';
import { User } from '@prisma/client';
import { fetchUser } from './thunks';

export interface AppSliceState {
    user?: User,
    loaded: boolean,
}

const initialState: AppSliceState = {
    loaded: false,
}

export const appSlice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        logout: (state) => {
            state.user = undefined;
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.user = action.payload;
        });
        builder.addCase(fetchUser.rejected, (state, action) => {
            state.loaded = true;
        })
    }
});

export const {
    logout,
} = appSlice.actions;
