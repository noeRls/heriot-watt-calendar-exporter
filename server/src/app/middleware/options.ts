import * as courseOptions from '../../../generated/coursesOption.json'
import * as studentGroup from '../../../generated/coursesOption.json';
import { Request, Response, NextFunction } from 'express';

export const useCourseOptions = (req: Request, _: Response, next: NextFunction) => {
    req.coursesOption = courseOptions.reduce<Record<string, boolean>>((acc, value) => {
        acc[value] = true
        return acc;
    }, {});
    return next();
};

export const useStudentGroupOptions = (req: Request, _: Response, next: NextFunction) => {
    req.studentGroupsOption = studentGroup.reduce<Record<string, boolean>>((acc, value) => {
        acc[value] = true
        return acc;
    }, {});
    return next();
};
