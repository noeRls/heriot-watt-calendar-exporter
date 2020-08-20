import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED,  } from 'http-status'
import { User } from '@prisma/client';
import { google } from 'googleapis';
import { loadAccessToken } from '../services/google/authentification';

export const isLogged = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.isAuthenticated()) {
        return next();
    }
    return res.status(UNAUTHORIZED).end();
}

export const useGoogle = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    try {
        req.googleClient = await loadAccessToken(user.accessToken, user.refreshToken);
        return next();
    } catch (e) {
        return res.status(UNAUTHORIZED).send('Token expired');
    }
}