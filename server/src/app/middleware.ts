import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from 'http-status'

export const isLogged = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(UNAUTHORIZED).end();
    }
    return next();
}