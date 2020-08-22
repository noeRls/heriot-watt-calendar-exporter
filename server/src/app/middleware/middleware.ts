import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR, } from 'http-status'
import { User, Course } from '@prisma/client';
import { google } from 'googleapis';
import { loadAccessToken } from '../../services/google/authentification';
import { prisma } from '../prisma';
import { withLogin } from '../../services/utils';
import { getCoursesOptions } from '../../services/hw/heriot-watt';

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

// const cacheTimeForCourses = 1000 * 60 * 60 * 24 * 7; // 7days
const cacheTimeForCourses = 1000 * 60 * 60; // 1hr
export const useCoursesOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let courses = await prisma.course.findMany();
        if (courses.length === 0) {
            console.log('courses not found fetching...');
            req.coursesOption = await withLogin(getCoursesOptions);
            await updateCoursesOption(req.coursesOption);
            return next();
        }
        req.coursesOption = courses.map(course => course.name);
        if (new Date(courses[0].updatedAt).getTime() > Date.now() + cacheTimeForCourses) {
            console.log('courses out of date, refreshing...');
            req.coursesOption = await withLogin(getCoursesOptions);
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