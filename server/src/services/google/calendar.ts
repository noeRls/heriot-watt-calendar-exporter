import { google, calendar_v3 } from 'googleapis';
import { Course, OAuth2Client, Calendar, Event } from '../types';
import { sleep } from '../utils';

export type CalendarApi = calendar_v3.Calendar;

const getCalendarApi = async (auth: OAuth2Client): Promise<CalendarApi> => google.calendar({ version: 'v3', auth });

export const listCalendar = async (auth: OAuth2Client): Promise<Calendar[]> => {
    const api = await getCalendarApi(auth);
    const { data } = await api.calendarList.list({
        minAccessRole: 'writer',
    });
    return data.items;
};

const loadEventsBetweenTime = async (
    api: CalendarApi,
    calendar: Calendar,
    startTimestamp: number,
    endTimestamp: number,
): Promise<Event[]> => {
    let events: Event[] = [];
    let nextPageToken: string;
    while (true) {
        const { data } = await api.events.list({
            calendarId: calendar.id,
            timeMin: new Date(startTimestamp - 1).toISOString(),
            timeMax: new Date(endTimestamp + 1).toISOString(),
            singleEvents: true,
            maxResults: 2500,
            orderBy: 'startTime',
            pageToken: nextPageToken,
        });
        events = events.concat(data.items);
        nextPageToken = data.nextPageToken;
        if (!nextPageToken) {
            break;
        }
        if (events.length > 10000) {
            throw new Error(`More than 10000 events bewteen ${new Date(startTimestamp)} and ${new Date(endTimestamp)} stopping`);
        }
    }
    return events;
};

const eventSignature = 'heriot watt calendar exporter';
const buildCourseDescription = (course: Course): string =>
`
Activity type: ${course.detail.activityType}
Code: ${course.detail.code}
Professor: ${course.detail.professor}
Teaching week: ${course.detail.teachingWeek}
Student group: ${course.block.title}

${eventSignature}
https://hw.box.noerls.com
`;

/**
 * The timestamp fetch by alarms is an UTC+0 time displayed on the website
 * We want to remove all UTC/Timezone things from the date
 * And set directly the timezone Europe/London
 *
 * On the website when course is displayed at 16h
 * It mean that at 16h in Scotland it will be the time to go to this course
 */
const timestampToDateWithTz = (timestamp: number) => ({
    dateTime: new Date(timestamp).toISOString().replace(/\..+/, ''),
    timeZone: 'Europe/London',
});

const createCourse = async (api: CalendarApi, course: Course, calendar: Calendar, colorId?: string): Promise<void> => {
    await api.events.insert({
        calendarId: calendar.id,
        requestBody: {
            end: timestampToDateWithTz(course.end),
            creator: {

            },
            start: timestampToDateWithTz(course.start),
            summary: course.detail.title,
            location: course.detail.locations.join(', '),
            description: buildCourseDescription(course),
            colorId,
            reminders: {
                useDefault: true,
            },
        },
    });
};

const scotlandSummerWinterDiff = 60 * 60 * 1000; // ms
const isSameTime = (timeOne: number, timeTwo: number) => {
    if (Math.abs(timeOne - timeTwo) <= scotlandSummerWinterDiff) {
        return true;
    }
    return false;
};

const courseExist = (events: Event[], course: Course): boolean =>
    events.some(event => event.summary === course.detail.title &&
        isSameTime(new Date(event.start.dateTime).getTime(), course.start) &&
        isSameTime(new Date(event.end.dateTime).getTime(),  course.end),
    );

export const createCourses = async (
    auth: OAuth2Client,
    courses: Course[],
    calendar: Calendar,
    colorId?: string,
): Promise<Course[]> => {
    if (courses.length === 0) {
        console.warn('No course received in google create courses');
        return [];
    }
    const api = await getCalendarApi(auth);
    const allTimes = courses.reduce<number[]>((acc, course) => acc.concat([course.start, course.end]), []);
    const events = await loadEventsBetweenTime(api, calendar, Math.min(...allTimes), Math.max(...allTimes));
    const newCourses = courses.filter(course => !courseExist(events, course));
    for (const course of newCourses) {
        console.log(`Creating course: ${course.detail.title} - ${timestampToDateWithTz(course.start).dateTime} -> ${timestampToDateWithTz(course.end).dateTime}`);
        await createCourse(api, course, calendar, colorId);
        await sleep(50);
    }
    return newCourses;
};

export const deleteAllEventsCreated = async (auth: OAuth2Client, calendarId: string): Promise<number> => {
    const api = await getCalendarApi(auth);
    let nextPageToken: string;
    let totalEventsDeleted = 0;
    let totalFetched = 0;
    while (true) {
        const { data } = await api.events.list({
            calendarId,
            maxResults: 2500,
            orderBy: 'updated',
            pageToken: nextPageToken,
            timeMin: '2020-08-22T01:30:14.405Z',
        });
        const events = data.items;
        nextPageToken = data.nextPageToken;
        for (const event of events) {
            if (event.description && event.description.includes(eventSignature)) {
                console.log('deleting: ', event.summary);
                await api.events.delete({
                    calendarId,
                    eventId: event.id,
                });
                await sleep(50);
                totalEventsDeleted += 1;
            }
        }
        if (!nextPageToken) {
            break;
        }
        totalFetched += events.length;
        if (totalFetched > 25000) {
            console.log('stopping at 25000 events');
            break;
        }
    }
    return totalEventsDeleted;
};
