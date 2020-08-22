import * as dotenv from 'dotenv';
dotenv.config();
import { getCourses, login, getCoursesOptions } from './hw/heriot-watt';
import { releasePage, getPage } from './hw/puppeteerProvider';
import { authentificate } from './google/authentification';
import { listCalendar, createCourses } from './google/calendar';
import { writeFileSync, readFileSync } from 'fs';
import { Course } from './types';
import { Page } from 'puppeteer';

const main = async () => {
    if (!process.env['HW_USERNAME'] || !process.env['HW_PWD']) {
        throw new Error('Invalid env');
    }
    // const page = await login(process.env['HW_USERNAME'], process.env['HW_PWD']);
    // const courses = await getCourses(page);
    // await releasePage(page);
    // writeFileSync('./courses.json', JSON.stringify(courses, null, 2));
    const courses: Course[] = JSON.parse(readFileSync('./courses.json').toString());
    // const calendars = await listCalendar(client);
    const client = await authentificate();
    console.log('authentificated');
    await createCourses(client, courses, { id: 'primary' });
}

// main().catch(console.error);
