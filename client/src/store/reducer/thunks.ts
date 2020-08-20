import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { failedToFetchUser, calendarListUpdate, userUpdated } from './reducer'

export const fetchUser = createAsyncThunk(
    'users/fetch',
    async (_, { dispatch }) => {
        try {
            const user = await api.fetchUser()
            dispatch(userUpdated(user));
            const calendars = await api.fetchCalendarList();
            dispatch(calendarListUpdate(calendars));
        } catch (e) {
            console.error(e);
            dispatch(failedToFetchUser());
        }
    }
);

export const fetchCalendar = createAsyncThunk(
    'users/calendar',
    () => api.fetchCalendarList()
);
