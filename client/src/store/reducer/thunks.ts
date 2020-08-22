import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export const fetchUser = createAsyncThunk(
    'users/fetch',
    () => api.fetchUser()
);

export const fetchCalendar = createAsyncThunk(
    'users/calendar',
    () => api.fetchCalendarList()
);

export const fetchCoursesOption = createAsyncThunk(
    'courses/list',
    () => api.fetchCoursesOption()
)

export const logout = createAsyncThunk(
    'users/logout',
    () => api.logout(),
)