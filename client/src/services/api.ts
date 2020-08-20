import Axios from 'axios';
import { User } from '@prisma/client';

export const axios = Axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

export const api = {
    fetchUser: async (): Promise<User> => {
        const { data } = await axios.get('/me');
        return data;
    }
}