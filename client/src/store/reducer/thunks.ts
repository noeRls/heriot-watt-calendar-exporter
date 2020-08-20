import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export const fetchUser = createAsyncThunk(
    'users/fetch',
    async () => api.fetchUser()
);