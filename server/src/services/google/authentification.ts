import * as fs from 'fs'
import * as readline from 'readline';
import { google } from 'googleapis';
import { Credentials, OAuth2Client } from '../types';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const TOKEN_PATH = './token.json';


export const authentificate = async (): Promise<OAuth2Client> => {
    if (!process.env['GOOGLE_CLIENT_ID'] || !process.env['GOOGLE_CLIENT_SECRET']) {
        throw new Error('Invalid env');
    }
    const oAuth2Client = new google.auth.OAuth2(
        process.env['GOOGLE_CLIENT_ID'],
        process.env['GOOGLE_CLIENT_SECRET'],
        'urn:ietf:wg:oauth:2.0:oob'
    );
    let token: Credentials = null;
    try {
        token = JSON.parse(fs.readFileSync(TOKEN_PATH).toString());
    } catch (e) {
        token = await getAccessToken(oAuth2Client);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    }
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}

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
    return client
}

const askQuestion = (question: string): Promise<string> =>
    new Promise((res) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(question, (code) => {
            rl.close();
            res(code);
        });
    });

async function getAccessToken(oAuth2Client: OAuth2Client): Promise<Credentials> {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const code = await askQuestion('Enter the code from that page here: ');
    const { tokens: token } = await oAuth2Client.getToken(code);
    return token;
}

