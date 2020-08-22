import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCalendars } from 'store/selector/app';
import { fetchCalendar } from 'store/reducer';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

interface GoogleCalendarPickerProps {
    onChange?: (calendarId?: string) => void;
}

export const GoogleCalendarPicker = ({ onChange = () => { } }: GoogleCalendarPickerProps) => {
    const dispatch = useDispatch();
    const calendars = useSelector(selectCalendars);
    useEffect(() => {
        dispatch(fetchCalendar());
    }, [dispatch])
    return (
        <Autocomplete
            loading={calendars.length === 0}
            options={Object.values(calendars)}
            onChange={(_, value) => onChange(value?.id)}
            getOptionLabel={(option) => option.summary || 'unkown'}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Calendar" placeholder="Select your calendar" />
            )}
        />
    );
}