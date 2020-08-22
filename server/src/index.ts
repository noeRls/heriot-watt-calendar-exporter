import * as express from 'express';
import { init as initDb } from './app/prisma';
import * as passport from 'passport';
import * as bodyParser from 'body-parser';
import routes from './app/routes'
import { corsMiddleware } from './app/middleware';
import * as logger from 'morgan';
const cookieSession = require('cookie-session');

const start = async () => {
    await initDb();

    const app = express();

    app.use(corsMiddleware);
    app.use(logger('dev'));
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieSession({ name: 'session', keys: ['super', 'secret'], axAge: 24 * 60 * 60 * 1000 }));
    app.use(passport.initialize());
    app.use(passport.session());

    routes(app);
    app.get('/hello', (_, res) => res.status(200).send('Hello World !'));

    app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}...`));
}

start().catch(console.error);
