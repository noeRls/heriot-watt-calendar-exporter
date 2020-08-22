import { Router, Request, Response } from 'express';
import { isLogged, useCoursesOption, useGoogle, useCalendar, validateMiddleware } from '../middleware';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status';
import { IsString } from 'class-validator';
import { deleteAllEventsCreated } from '../../services/google/calendar';

const router = Router();

router.get('/courses/list', isLogged, useCoursesOption, (req: Request, res: Response) => {
    return res.status(OK).send(req.coursesOption);
});

class CalendarDeleteBody {
    @IsString()
    calendarId: string;
}

router.delete('/courses',
    isLogged,
    validateMiddleware(CalendarDeleteBody),
    useGoogle,
    useCalendar(),
    async (req: Request, res: Response) => {
        try {
            const nbEventDeleted = await deleteAllEventsCreated(req.googleClient, req.calendar.id);
            return res.status(OK).send(nbEventDeleted);
        } catch (e) {
            console.error(e);
            return res.status(INTERNAL_SERVER_ERROR).end();
        }
});

export default router;