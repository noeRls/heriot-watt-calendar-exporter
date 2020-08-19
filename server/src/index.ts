import * as express from 'express';
import { init as initDb } from './app/prisma';
import * as passport from 'passport';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import authentification from './app/authentification';
import { corsMiddleware } from './app/cors';
import * as logger from 'morgan';

const start = async () => {
    // await initDb();

    const app = express();

    app.use(corsMiddleware);
    app.use(logger('dev'));
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({ secret: 'super-secret', resave: true, saveUninitialized: true, }));
    app.use(passport.initialize());

    app.use(authentification);
    app.get('/hello', (_, res) => res.status(200).send('Hello World !'));

    app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}...`));
}

start().catch(console.error);