import Axios from 'axios';
import { User } from '@prisma/client';
import { Calendar } from 'types';

export const axios = Axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

export const api = {
    fetchUser: async (): Promise<User> => {
        const { data } = await axios.get('/me');
        return data;
    },
    fetchCalendarList: async (): Promise<Calendar[]> => {
        const { data } = await axios.get('/calendar/list');
        return data;
    },
}