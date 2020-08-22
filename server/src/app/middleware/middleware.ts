import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR, BAD_REQUEST, } from 'http-status'
import { User, Course } from '@prisma/client';
import { google } from 'googleapis';
import { loadAccessToken } from '../../services/google/authentification';
import { prisma } from '../prisma';
import { withLogin } from '../../services/utils';
import { getCoursesOptions } from '../../services/hw/heriot-watt';
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

const updateCoursesOption = async (courses: string[]): Promise<void> => {
    await Promise.all(courses.map(course => prisma.course.create({ data: { name: course } })));
}


const fetchCoursesOption = async (): Promise<string[]> => {
    const minCourseThreshold = 1500;
    let retry = 5;
    let courses: string[] = [];
    while (courses.length < minCourseThreshold && retry > 0) {
        courses = await withLogin(getCoursesOptions);
        retry -= 1;
    }
    return courses;
}
const cacheTimeForCourses = 1000 * 60 * 60 * 24 * 7; // 7days
// const cacheTimeForCourses = 1000 * 60; // 1hr
export const useCoursesOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let courses = await prisma.course.findMany();
        if (courses.length === 0) {
            console.log('courses not found fetching...');
            req.coursesOption = await fetchCoursesOption();
            await updateCoursesOption(req.coursesOption);
            return next();
        }
        req.coursesOption = courses.map(course => course.name);
        if (new Date(courses[0].updatedAt).getTime() + cacheTimeForCourses < Date.now()) {
            console.log('courses out of date, refreshing...');
            req.coursesOption = await fetchCoursesOption();
            console.log(req.coursesOption.length);
            await prisma.$executeRaw('DELETE FROM "Course"');
            await updateCoursesOption(req.coursesOption);
        }
        return next();
    } catch (e) {
        console.error(e);
        return res.status(INTERNAL_SERVER_ERROR).end();
    }
}

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

export const useCalendar = (where: 'body' | 'query' | 'params' = 'body') => async (req: Request, res: Response, next: NextFunction) => {
    const { calendarId } = req[where];
    if (!calendarId) return res.status(BAD_REQUEST).send('calendarId not provided');
    if (!req.googleClient) return res.status(INTERNAL_SERVER_ERROR).end();
    try {
        const calendars = await listCalendar(req.googleClient);
        const calendar = calendars.find(calendar => calendar.id === calendarId);
        if (!calendar) {
            return res.status(BAD_REQUEST).send('Invalid calendar id');
        }
        req.calendar = calendar;
        return next();
    } catch (e) {
        console.error(e);
        return res.status(INTERNAL_SERVER_ERROR).end();
    }
}