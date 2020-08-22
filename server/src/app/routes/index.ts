import { Express } from "express";
import AuthRoutes from './authentification';
import CoursesRoutes from './courses';
import UserRoutes from './user';
import SyncRequestRoutes from './syncrequest';

export default (app: Express) => {
    app.use(AuthRoutes);
    app.use(CoursesRoutes);
    app.use(UserRoutes);
    app.use(SyncRequestRoutes);
}