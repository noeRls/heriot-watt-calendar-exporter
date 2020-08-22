import { google, calendar_v3 } from 'googleapis';
import { Course, OAuth2Client, Calendar, Event } from '../types';

export type CalendarApi = calendar_v3.Calendar;

const getCalendarApi = async (auth: OAuth2Client): Promise<CalendarApi> => google.calendar({ version: 'v3', auth });

export const listCalendar = async (auth: OAuth2Client): Promise<Calendar[]> => {
    const api = await getCalendarApi(auth);
    const { data } = await api.calendarList.list();
    return data.items;
}

const loadEventsBetweenTime = async (api: CalendarApi, calendar: Calendar, startTimestamp: number, endTimestamp: number): Promise<Event[]> => {
    let events: Event[] = [];
    let nextPageToken: string = undefined;
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
}

const eventSignature = 'heriot watt calendar exporter';
const buildCourseDescription = (course: Course): string =>
`
${course.block.id} - ${course.block.title}
Title: ${course.detail.title}
Activity type: ${course.detail.activityType}
Code: ${course.detail.code}
Professor: ${course.detail.professor}
Teaching week: ${course.detail.teachingWeek}

${eventSignature}
`

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
            summary: course.block.title,
            location: course.detail.locations.join(', '),
            description: buildCourseDescription(course),
            colorId,
        }
    });
}

const scotlandUTCDiff = 60 * 60 * 1000; //ms
const courseExist = (events: Event[], course: Course): boolean =>
    events.some(event => event.summary === course.block.title &&
        new Date(event.start.dateTime).getTime() === course.start - scotlandUTCDiff &&
        new Date(event.end.dateTime).getTime() === course.end - scotlandUTCDiff
    )

export const createCourses = async (auth: OAuth2Client, courses: Course[], calendar: Calendar, colorId?: string): Promise<Course[]> => {
    if (courses.length === 0) {
        console.warn('No course received in google create courses')
        return [];
    }
    const api = await getCalendarApi(auth);
    const allTimes = courses.reduce<number[]>((acc, course) => acc.concat([course.start, course.end]), []);
    const events = await loadEventsBetweenTime(api, calendar, Math.min(...allTimes), Math.max(...allTimes));
    const newCourses = courses.filter(course => !courseExist(events, course));
    await Promise.all(newCourses.map(async course => {
        console.log(`Creating course: ${course.block.id} - ${timestampToDateWithTz(course.start).dateTime} -> ${timestampToDateWithTz(course.end).dateTime}`);
        await createCourse(api, course, calendar, colorId);
    }));
    return newCourses;
}

export const deleteAllEventsCreated = async (auth: OAuth2Client, calendarId: string): Promise<number> => {
    const api = await getCalendarApi(auth);
    let events: Event[] = [];
    let nextPageToken: string = undefined;
    while (true) {
        const { data } = await api.events.list({
            calendarId,
            maxResults: 2500,
            orderBy: 'updated',
            pageToken: nextPageToken,
        });
        events = events.concat(data.items);
        nextPageToken = data.nextPageToken;
        if (!nextPageToken) {
            break;
        }
        if (events.length > 10000) {
            console.log('stopping at 10000 events');
            break;
        }
    }
    let totalEventsDeleted = 0;
    await Promise.all(events.map(async event => {
        if (event.description && event.description.includes(eventSignature)) {
            totalEventsDeleted += 1;
            console.log('deleting: ', event.summary);
            await api.events.delete({
                calendarId,
                eventId: event.id,
            });
        }
    }));
    return totalEventsDeleted;
}