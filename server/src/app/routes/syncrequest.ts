import { Router, Request, Response, NextFunction } from 'express';
import { isLogged, useGoogle, validateMiddleware, useCalendar } from '../middleware';
import { IsString, IsNumber, Max, Min, IsArray, ArrayMinSize } from 'class-validator';
import { createCourses } from '../../services/google/calendar';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, FORBIDDEN } from 'http-status';
import { prisma } from '../prisma';
import { User, SyncRequest } from '@prisma/client';
import { getCourses } from '../../services/hw/heriot-watt';
import { withLogin } from '../../services/utils';
import { serializeError } from 'serialize-error';
import httpStatus = require('http-status');
import { useStudentGroupOptions, useCourseOptions } from '../middleware/options';

const router = Router();

if (!process.env.RATE_LIMIT_REQUEST || Number.isNaN(Number(process.env.RATE_LIMIT_REQUEST))) {
    console.error('Misssing RATE_LIMIT_REQUEST env variable')
}
const useSyncRequestLimit = async (req: Request, res: Response, next: NextFunction) => {
    const ONE_DAY_MS = 1000 * 60 * 60 * 24;
    try {
        const requests = await prisma.syncRequest.findMany({
            where: {
                AND: {
                    userId: (req.user as User).id,
                    createdAt: {
                        gte: new Date(Date.now() - ONE_DAY_MS),
                    },
                },

            },
        });
        if (requests.length >= Number(process.env.RATE_LIMIT_REQUEST)) {
            return res.status(FORBIDDEN).send({ code: 'RATE_LIMIT' });
        }
        return next();
    } catch (e) {
        console.error(e);
        return res.status(INTERNAL_SERVER_ERROR).end();
    }
};

class SyncRequestBody {
    @IsString()
    calendarId: string;

    @IsNumber()
    @Max(11)
    @Min(1)
    colorId: number;

    @IsString({
        each: true,
    })
    @IsArray()
    @ArrayMinSize(1)
    courses: string[];

    @IsString({
        each: true,
    })
    @IsArray()
    @ArrayMinSize(1)
    studentGroups: string[];
}

router.post('/syncrequest',
    isLogged,
    validateMiddleware(SyncRequestBody),
    useSyncRequestLimit,
    useGoogle,
    useCalendar(),
    useCourseOptions,
    useStudentGroupOptions,
    async (req: Request, res: Response) => {
    const { courses, colorId, studentGroups } = req.body as SyncRequestBody;
    const { calendar } = req;
    if (courses.some(course => !req.coursesOption[course])) {
        return res.status(BAD_REQUEST).send('Invalid courses');
    }
    if (studentGroups.some(studentGroup => req.studentGroupsOption[studentGroup])) {
        return res.status(BAD_REQUEST).send('Invalid student group');
    }

    let syncRequest: SyncRequest;
    try {
        syncRequest = await prisma.syncRequest.create({
            data: {
                user: {
                    connect: {
                        id: (req.user as User).id,
                    },
                },
            },
        });
        res.status(OK).send(syncRequest);
    } catch (e) {
        console.error(e);
        return res.status(INTERNAL_SERVER_ERROR).end();
    }

    try {
        const coursesFound = await withLogin(page => getCourses(page, courses, studentGroups));
        await prisma.syncRequest.update({
            where: { id: syncRequest.id },
            data: { coursesFound: coursesFound.length },
        });
        const coursesAdded = await createCourses(req.googleClient, coursesFound, calendar, colorId.toString());
        await prisma.syncRequest.update({
            where: { id: syncRequest.id },
            data: { coursesAdded: coursesAdded.length },
        });
    } catch (e) {
        console.error(e);
        const error = serializeError(e);
        prisma.syncRequest.update({
            where: { id: syncRequest.id },
            data: {
                error: error.stack || error.message || error.name || e.toString() || 'Unkown error',
            },
        }).catch(console.error);
    }
});

const withSyncRequest = (where: 'body' | 'query' | 'params' = 'params') =>
    async (req: Request, res: Response, next: NextFunction) => {
    const { id: stringId } = req[where];
    const id = Number(stringId);
    if (!id || Number.isNaN(id)) {
        return res.status(BAD_REQUEST).send('Invalid sync request id');
    }
    const syncRequest = await prisma.syncRequest.findOne({
        where: { id },
    });
    if (!syncRequest) {
        return res.status(httpStatus.BAD_REQUEST).send('Unexisting request');
    }
    if (syncRequest.userId !== (req.user as User).id) {
        return res.status(httpStatus.UNAUTHORIZED).end();
    }
    req.syncRequest = syncRequest;
    return next();
};

router.get('/syncrequest/:id', isLogged, withSyncRequest(), async (req: Request, res: Response) => {
    return res.status(OK).send(req.syncRequest);
});

export default router;