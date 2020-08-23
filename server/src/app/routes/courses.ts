import { Router, Request, Response } from 'express';
import { isLogged, useGoogle, useCalendar } from '../middleware';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status';
import { deleteAllEventsCreated } from '../../services/google/calendar';

const router = Router();

router.delete('/courses/:calendarId',
    isLogged,
    useGoogle,
    useCalendar('params'),
    async (req: Request, res: Response) => {
        try {
            const nbEventDeleted = await deleteAllEventsCreated(req.googleClient, req.calendar.id);
            return res.status(OK).send({ nbEventDeleted });
        } catch (e) {
            console.error(e);
            return res.status(INTERNAL_SERVER_ERROR).end();
        }
});

export default router;