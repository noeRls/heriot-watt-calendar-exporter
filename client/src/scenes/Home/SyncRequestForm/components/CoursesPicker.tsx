import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoursesOption } from 'store/reducer';
import { selectCoursesOption } from 'store/selector/app';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

interface CoursesPickerProps {
    onChange?: (courses: string[]) => void;
}

export const CoursesPicker = ({ onChange = () => {} }: CoursesPickerProps) => {
    const disaptch = useDispatch();
    useEffect(() => {
        disaptch(fetchCoursesOption());
    }, [disaptch]);
    const options = useSelector(selectCoursesOption);
    return (
        <Autocomplete
        multiple
        options={options}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        onChange={(_, value) => onChange(value)}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Courses" placeholder="Select your courses" />
        )}
      />
    )
}