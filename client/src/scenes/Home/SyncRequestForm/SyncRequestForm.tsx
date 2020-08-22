import React, { useCallback, useState } from 'react';
import { GoogleCalendarPicker } from './components/GoogleCalendarPicker';
import { CoursesPicker } from './components/CoursesPicker';
import { Button } from '@material-ui/core';
import { ColorPicker, initialColorId } from './components/ColorPicker';
import style from './SyncRequestForm.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { selectSyncRequestStatus, selectCalendar } from 'store/selector/app';
import { createSyncRequest } from 'store/reducer';

export const SyncRequestForm = () => {
    const calendar = useSelector(selectCalendar);
    const [courses, setCourses] = useState<string[]>([]);
    const [colorId, setColorId] = useState<number>(initialColorId);
    const dispatch = useDispatch();
    const syncRequestStatus = useSelector(selectSyncRequestStatus);

    const startSynchronisation = useCallback(() => {
        if (!calendar || !calendar.id || !colorId || courses.length === 0) {
            return;
        }
        dispatch(createSyncRequest({
            calendarId: calendar.id,
            colorId,
            courses,
        }))
    }, [calendar, courses, colorId, dispatch]);

    return (
        <div className={style.formItemContainer}>
            <GoogleCalendarPicker />
            <CoursesPicker onChange={setCourses} />
            <ColorPicker onChange={setColorId} />
            <Button
                disabled={!calendar || !calendar.id || !colorId || courses.length === 0 || syncRequestStatus === 'loading'}
                variant="contained"
                color="primary"
                onClick={startSynchronisation}
            >
                Start synchronisation
            </Button>
        </div>
    );
}