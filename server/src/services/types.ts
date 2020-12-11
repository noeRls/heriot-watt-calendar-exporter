import { google, calendar_v3 } from 'googleapis';

export type OAuth2Client = typeof google.auth.OAuth2.prototype;
export type Credentials = typeof google.auth.OAuth2.prototype.credentials;
export type Calendar = calendar_v3.Schema$CalendarListEntry;
export type Event = calendar_v3.Schema$Event;


export interface StudentGroup {
    title: string;
}

export interface CourseDetail {
    title?: string;
    code?: string;
    teachingWeek?: string;
    locations: string[];
    activityType?: string;
    professor?: string;
}

export interface Course {
    block: StudentGroup;
    start: number;
    end: number;
    detail: CourseDetail;
}
