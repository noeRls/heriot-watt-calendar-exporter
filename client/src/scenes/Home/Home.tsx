import React from 'react';
import { SyncRequestForm } from './SyncRequestForm/SyncRequestForm';
import { SyncRequestTimeline } from './SyncRequestTimeline';

export const Home = () => (
    <>
        <SyncRequestForm />
        <SyncRequestTimeline />
    </>
)