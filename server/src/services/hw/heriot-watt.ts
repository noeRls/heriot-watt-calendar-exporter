import * as puppeteer from 'puppeteer';
import { getPage, releasePage } from './puppeteerProvider';
import { Page, ElementHandle } from 'puppeteer';
import { Dictionary } from 'ramda';
import { parseTimelines } from './parseTimelines';
import { Course } from '../types';

const HW_URL = "https://timetable.hw.ac.uk/WebTimetables/LiveED/login.aspx";

export const login = async (): Promise<Page> => {
    const page = await getPage();
    await page.goto(HW_URL);

    const GUEST_LOGIN_BUTTON = 'input[name="bGuestLogin"]';
    await page.waitFor(GUEST_LOGIN_BUTTON);
    await page.click(GUEST_LOGIN_BUTTON);

    return page;
};

const COURSES_SELECTION_SELECTOR = 'select[id="dlObject"]';
const selectCoursesOption = async (page: Page, courses: string[]) => {
    await page.waitFor(COURSES_SELECTION_SELECTOR);
    await page.keyboard.down('Control');
    for (const course of courses) {
        console.log('selecting: ', course);
        const coursesSection = await page.$(COURSES_SELECTION_SELECTOR);
        const courseElements = await coursesSection.$x(`//*[contains(text(),"${course}")]`);
        if (courseElements.length > 1) {
            console.warn(`Course ${course} have ${courseElements.length} options`);
        }
        for (const element of courseElements) {
            await element.click();
        }
    }
    await page.keyboard.up('Control');
};

export const goToRowCoursesPage = async (page: Page) => {
    const COURSES_LINK_SELECTOR = 'a[id="LinkBtn_modules"]';
    await page.waitFor(COURSES_LINK_SELECTOR);
    await page.click(COURSES_LINK_SELECTOR);
    await page.waitFor(COURSES_SELECTION_SELECTOR);
    await page.waitFor(1000); // wait everything to load
};

export const goToStudendGroupCoursesPage = async (page: Page) => {
    const STUEND_GROUP_COURSES_SELECTOR = 'a[id="LinkBtn_studentsets"]';
    await page.waitFor(STUEND_GROUP_COURSES_SELECTOR);
    await page.click(STUEND_GROUP_COURSES_SELECTOR);
    await page.waitFor(COURSES_SELECTION_SELECTOR);
    await page.waitFor(1000); // wait everything to load
}

export const getCoursesOptions = async (page: Page): Promise<string[]> => {
    const optionContainer = await page.$(COURSES_SELECTION_SELECTOR);
    const optionsElement = await optionContainer.$$('option');
    const options: string[] = [];
    for(const optionEl of optionsElement) {
        options.push(await optionEl.evaluate(el => el.textContent));
    }
    return options;
};

const selectWeek = async (page: Page, week: number) => {
    const weekSelection = await page.$('select[id="lbWeeks"]');
    await (await weekSelection.$(`option[value="${week.toString().padStart(2, ' ')}"]`)).click();
};

const numberOfWeeks = 52;
// const numberOfWeeks = 3;
const selectTimelines = async (page: Page, courses: string[], studentGroups: string[]): Promise<Course[]> => {
    await goToStudendGroupCoursesPage(page);
    await selectCoursesOption(page, studentGroups);
    await selectWeek(page, 1);
    await page.click('input[name="bGetTimetable"]');
    await page.waitFor(4000);
    let results: Course[] = [];
    const limit = numberOfWeeks;
    for (let i = 0; i < limit; i++) {
        results = results.concat(await parseTimelines(page));
        if (i + 1 < limit) {
            await page.waitFor('a[id="bNextWeek"]');
            await page.click('a[id="bNextWeek"]');
            await page.waitFor(2000);
        }
    }
    const coursesDic = courses.reduce<Record<string, boolean>>((acc, course) => {
        acc[course] = true;
        return acc;
    }, {});
    console.log(`${results.length} courses grab`);
    results = results.filter(result => coursesDic[result.block.id]);
    console.log(`${results.length} selected`);
    return results;
};

export const getCourses = async (page: Page, courses: string[], studentGroups: string[]): Promise<Course[]> => {
    return selectTimelines(page, courses, studentGroups);
};
