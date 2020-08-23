import { Router, Request, Response } from 'express';
import * as passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { prisma } from '../prisma';
import { User } from '@prisma/client';

const router = Router();

passport.use(new GoogleStrategy({
    clientID: process.env.SERVER_GOOGLE_CLIENT_ID,
    clientSecret: process.env.SERVER_GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findOne({ where: { id: profile.id } });
        if (user) {
            await prisma.user.update({
                data: {
                    accessToken,
                    refreshToken,
                },
                where: {
                    id: profile.id,
                },
            });
            return done(null, user);
        }
        user = await prisma.user.create({
            data: {
                id: profile.id,
                refreshToken,
                accessToken,
            },
        });
        return done(null, user);
    } catch (e) {
        console.error(e);
        done(e, null);
    }
}));

passport.serializeUser((user: User, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findOne({ where: { id }});
        if (!user) {
            done(new Error('User not found'), null);
        }
        done(null, user);
    } catch (e) {
        console.error(e);
        done(e, null);
    }
});

const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
router.get('/auth/google', passport.authenticate('google', { scope: SCOPES }));

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.APP_URL}/login`,
    session: true,
    successRedirect: `${process.env.APP_URL}`,
}));

export default router;