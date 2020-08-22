import { Router, Request, Response } from 'express';
import { isLogged, useCoursesOption } from '../middleware';
import { OK } from 'http-status';

const router = Router();

router.get('/courses/list', isLogged, useCoursesOption, (req: Request, res: Response) => {
    return res.status(OK).send(req.coursesOption);
});

export default router;