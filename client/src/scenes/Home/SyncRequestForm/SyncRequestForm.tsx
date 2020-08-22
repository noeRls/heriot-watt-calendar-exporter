import React, { useCallback, useState } from 'react';
import { GoogleCalendarPicker } from './components/GoogleCalendarPicker';
import { CoursesPicker } from './components/CoursesPicker';
import { Button } from '@material-ui/core';
import { ColorPicker, initialColorId } from './components/ColorPicker';
import style from './SyncRequestForm.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { selectSyncRequestStatus } from 'store/selector/app';
import { createSyncRequest } from 'store/reducer';

export const SyncRequestForm = () => {
    const [calendarId, setCalendarId] = useState<string>()
    const [courses, setCourses] = useState<string[]>([]);
    const [colorId, setColorId] = useState<number>(initialColorId);
    const dispatch = useDispatch();
    const syncRequestStatus = useSelector(selectSyncRequestStatus);

    const startSynchronisation = useCallback(() => {
        if (!calendarId || !colorId || courses.length === 0) {
            return;
        }
        dispatch(createSyncRequest({
            calendarId,
            colorId,
            courses,
        }))
    }, [calendarId, courses, colorId, dispatch]);

    return (
        <div className={style.formItemContainer}>
            <GoogleCalendarPicker onChange={setCalendarId}/>
            <CoursesPicker onChange={setCourses} />
            <ColorPicker onChange={setColorId} />
            <Button
                disabled={!calendarId || !colorId || courses.length === 0 || syncRequestStatus === 'loading'}
                variant="contained"
                color="primary"
                onClick={startSynchronisation}
            >
                Start synchronisation
            </Button>
        </div>
    );
}