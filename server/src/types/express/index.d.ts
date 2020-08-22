declare namespace Express {
    export interface Request {
        googleClient?: import("../../services/types").OAuth2Client;
        coursesOption?: string[];
        syncRequest?: import('@prisma/client').SyncRequest;
        calendar?: import("../../services/types").Calendar;
    }
}