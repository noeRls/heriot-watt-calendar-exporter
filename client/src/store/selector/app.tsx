import { RootState } from "../store"
import { createSelector } from "@reduxjs/toolkit";

const selectAppState = (state: RootState) => state.app;

export const selectUser = createSelector(
    [selectAppState],
    app => app.user
)

export const selectAppIsLoaded = createSelector(
    [selectAppState],
    app => app.loaded,
);

export const selectCalendars = createSelector(
    [selectAppState],
    app => app.calendars,
);

export const selectCoursesOption = createSelector(
    [selectAppState],
    app => app.coursesOption,
);
