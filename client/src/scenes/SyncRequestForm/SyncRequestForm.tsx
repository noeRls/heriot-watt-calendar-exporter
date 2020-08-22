import React, { useCallback, useState } from 'react';
import { GoogleCalendarPicker } from './components/GoogleCalendarPicker';
import { CoursesPicker } from './components/CoursesPicker';
import { Button } from '@material-ui/core';
import { ColorPicker } from './components/ColorPicker';

export const SyncRequestForm = () => {
    const [selectedCalendar, setSelectedCalendar] = useState<string>()
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<number>();

    const startSynchronisation = useCallback(() => {

    }, [selectedCalendar, selectedCourses, selectedColor])

    return (
        <div>
            <GoogleCalendarPicker onChange={setSelectedCalendar} />
            <CoursesPicker onChange={setSelectedCourses} />
            <ColorPicker onChange={setSelectedColor} />
            <Button disabled={!selectedCalendar || selectedCourses.length === 0} variant="contained" color="primary" >
                Start synchronisation
            </Button>
        </div>
    );
}