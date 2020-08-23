import * as express from 'express';
import { init as initDb } from './app/prisma';
import * as passport from 'passport';
import * as bodyParser from 'body-parser';
import routes from './app/routes';
import { corsMiddleware } from './app/middleware';
import * as logger from 'morgan';
// tslint:disable-next-line:no-var-requires
const cookieSession = require('cookie-session');

if (!process.env.COOKIE_SESSION_SECRET) {
    console.error('Missing COOKIE_SESSION_SECRET env variable');
}
const start = async () => {
    await initDb();

    const app = express();

    app.use(corsMiddleware);
    app.use(logger('dev'));
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(cookieSession({ name: 'session', keys: [process.env.COOKIE_SESSION_SECRET], axAge: 24 * 60 * 60 * 1000 }));
    app.use(passport.initialize());
    app.use(passport.session());

    routes(app);
    app.get('/hello', (_, res) => res.status(200).send('Hello World !'));

    app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}...`));
};

start().catch(console.error);
