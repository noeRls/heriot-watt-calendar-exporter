import { google } from 'googleapis';
import { calendar_v3 } from 'googleapis/build/src/apis/calendar/v3';
import { Course, OAuth2Client } from '../types';
import { time } from 'console';

export type Calendar = calendar_v3.Schema$Calendar;
export type CalendarApi = calendar_v3.Calendar;
export type Event = calendar_v3.Schema$Event;

export function listEvents(auth: OAuth2Client) {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
            console.log('No upcoming events found.');
        }
    });
}

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

const buildCourseDescription = (course: Course): string =>
`
${course.block.id} - ${course.block.title}
Title: ${course.detail.title}
Activity type: ${course.detail.activityType}
Code: ${course.detail.code}
Professor: ${course.detail.professor}
Teaching week: ${course.detail.teachingWeek}
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

const createCourse = async (api: CalendarApi, course: Course, calendar: Calendar): Promise<void> => {
    await api.events.insert({
        calendarId: calendar.id,
        requestBody: {
            end: timestampToDateWithTz(course.end),
            start: timestampToDateWithTz(course.start),
            summary: course.block.title,
            location: course.detail.locations.join(', '),
            description: buildCourseDescription(course)
        }
    });
}

const courseExist = (events: Event[], course: Course): boolean =>
    events.some(event => event.summary === course.block.title &&
        new Date(event.start.dateTime).getTime() === course.start &&
        new Date(event.end.dateTime).getTime() === course.end
    )

export const createCourses = async (auth: OAuth2Client, courses: Course[], calendar: Calendar): Promise<Course[]> => {
    const api = await getCalendarApi(auth);
    const allTimes = courses.reduce<number[]>((acc, course) => acc.concat([course.start, course.end]), []);
    const events = await loadEventsBetweenTime(api, calendar, Math.min(...allTimes), Math.max(...allTimes));
    const newCourses = courses.filter(course => !courseExist(events, course));
    for (const course of newCourses) {
        console.log(`Creating course: ${course.block.id} - ${timestampToDateWithTz(course.start).dateTime} -> ${timestampToDateWithTz(course.end).dateTime}`);
        await createCourse(api, course, calendar);
    }
    return newCourses;
}