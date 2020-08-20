import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@prisma/client';
import { Calendar } from 'types';

export interface AppSliceState {
    user?: User,
    loaded: boolean,
    calendars: Calendar[],
}

const initialState: AppSliceState = {
    loaded: false,
    calendars: []
}

export const appSlice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        logout: (state) => {
            state.user = undefined;
        },
        calendarListUpdate: (state, action: PayloadAction<Calendar[]>) => {
            state.calendars = action.payload;
        },
        userUpdated: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.loaded = true;
        },
        failedToFetchUser: (state) => {
            state.user = undefined;
            state.loaded = true;
        },
    },
});

export const {
    logout,
    calendarListUpdate,
    userUpdated,
    failedToFetchUser,
} = appSlice.actions;
