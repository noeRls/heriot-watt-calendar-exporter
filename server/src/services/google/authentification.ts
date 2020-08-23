import { google } from 'googleapis';
import { OAuth2Client } from '../types';

export const loadAccessToken = async (accessToken: string, refreshToken?: string): Promise<OAuth2Client> => {
    const client = new google.auth.OAuth2(process.env.SERVER_GOOGLE_CLIENT_ID, process.env.SERVER_GOOGLE_CLIENT_SECRET);
    client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    const { expiry_date } = await client.getTokenInfo(accessToken);
    if (new Date(expiry_date).getTime() < Date.now()) {
        throw new Error('TOKEN_EXPIRED');
    }
    return client;
};
