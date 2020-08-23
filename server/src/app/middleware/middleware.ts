import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status';
import { User } from '@prisma/client';
import { loadAccessToken } from '../../services/google/authentification';
import { plainToClass } from 'class-transformer';
import * as classValidator from 'class-validator';
import { ClassType } from 'class-transformer/ClassTransformer';
import httpStatus = require('http-status');
import { listCalendar } from '../../services/google/calendar';

export const isLogged = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.isAuthenticated()) {
        return next();
    }
    return res.status(UNAUTHORIZED).end();
};

export const useGoogle = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    try {
        req.googleClient = await loadAccessToken(user.accessToken, user.refreshToken);
        return next();
    } catch (e) {
        return res.status(UNAUTHORIZED).send('Token expired');
    }
};

export function validateMiddleware<T>(type: ClassType<T>, where: 'body' | 'query' | 'params' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
        const parsedBody = plainToClass(type, req[where]);
        const errors = await classValidator.validate(parsedBody);
        if (errors.length !== 0) {
            const message = errors.join('');
            console.log('Validation error: ', message);
            return res.status(httpStatus.BAD_REQUEST).send(message);
        }
        req.body = parsedBody;
        return next();
    };
}

export const useCalendar = (where: 'body' | 'query' | 'params' = 'body') =>
    async (req: Request, res: Response, next: NextFunction) => {
    const { calendarId } = req[where];
    if (!calendarId) return res.status(BAD_REQUEST).send('calendarId not provided');
    if (!req.googleClient) return res.status(INTERNAL_SERVER_ERROR).end();
    try {
        const calendars = await listCalendar(req.googleClient);
        const calendar = calendars.find(({ id }) => id === calendarId);
        if (!calendar) {
            return res.status(BAD_REQUEST).send('Invalid calendar id');
        }
        req.calendar = calendar;
        return next();
    } catch (e) {
        console.error(e);
        return res.status(INTERNAL_SERVER_ERROR).end();
    }
};


