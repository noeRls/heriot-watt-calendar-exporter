import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from 'http-status'

export const isLogged = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.isAuthenticated()) {
        return next();
    }
    return res.status(UNAUTHORIZED).end();
}