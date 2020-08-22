import { Router, Request, Response } from 'express';
import { isLogged, useGoogle } from '../middleware';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status';
import { listCalendar } from '../../services/google/calendar';
import { User } from '@prisma/client';

const router = Router();

router.get('/me', isLogged, (req: Request, res: Response) => {
    const user = req.user as User;
    return res.status(200).send({ id: user.id });
});

router.post('/logout', isLogged, (req: Request, res: Response) => {
    req.logOut();
    res.status(200).end();
});

router.get('/calendar/list', isLogged, useGoogle, async (req: Request, res: Response) => {
    try {
        const calendar = await listCalendar(req.googleClient);
        return res.status(OK).send(calendar);
    } catch (e) {
        console.error(e);
        return res.status(INTERNAL_SERVER_ERROR).end();
    }
});

export default router;