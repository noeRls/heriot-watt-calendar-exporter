declare namespace Express {
    export interface Request {
        googleClient?: import("../../services/types").OAuth2Client;
        coursesOption?: string[]
    }
}