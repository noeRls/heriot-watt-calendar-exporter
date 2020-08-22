import * as puppeteer from 'puppeteer';
import { getPage, releasePage } from './puppeteerProvider'
import { Page, ElementHandle } from 'puppeteer';
import { Dictionary, last } from 'ramda';
import { Block, CourseDetail, Course } from '../types';

interface DayTime {
    hour: number;
    min: number;
}

const extractText = async (selector: string, element?: ElementHandle): Promise<string | undefined> => {
    if (!element) {
        return null;
    }
    const resultElement = await element.$(selector);
    if (!resultElement) {
        return null;
    }
    return resultElement.evaluate(el => el.textContent);
}

const parseHeader = async (header: ElementHandle): Promise<{
    block: Block,
    weekStart: string;
}> => {
    const block: Block = {
        id: await extractText('.header-1-1-0', header),
        title: await extractText('.header-1-1-2', header),
    }
    const week = await extractText('.header-2-2-3', header);
    if (!week) {
        throw new Error('Failed to parse week in header');
    }
    const [weekStart] = week.split('-');
    return {
        block,
        weekStart,
    };
}

const parseHoursRow = async (column: ElementHandle): Promise<DayTime[]> => {
    const hours: DayTime[] = [];
    const hoursElement = await column.$$('td');
    for (let i = 1; i < hoursElement.length; i++) {
        const timeText = await hoursElement[i].evaluate(el => el.textContent);
        if (!timeText) {
            continue;
        }
        const [hour, min] = timeText.split(':');
        hours.push({
            hour: Number(hour),
            min: Number(min),
        });
    }
    if (hours.length > 0) {
        const lastTime = hours[hours.length - 1];
        const min = (lastTime.min + 15) % 60;
        const hour = min === 0 ? lastTime.hour + 1 : lastTime.hour;
        hours.push({
            hour,
            min,
        });
    }
    return hours;
}

const parseDays = async (table: ElementHandle): Promise<string[]> => {
    const daysElement = await table.$$('.row-label-one');
    const days: string[] = [];
    for (let i = 0; i < daysElement.length; i++) {
        const timeText = await daysElement[i].evaluate(el => el.textContent);
        days.push(timeText);
    }
    return days;
}

const parseCell = async (cell: ElementHandle): Promise<CourseDetail> => {
    const lines = await cell.$$('table');
    const teachingWeek = await extractText('td[align="center"]', lines[0]);
    const locationString = await extractText('td[align="right"]', lines[0]);
    const locations = locationString ? locationString.split(';').map(w => w.replace(/\s/g, '')) : [];
    const activityType = await extractText('td[align="right"]', lines[2]);
    const professor = await extractText('td[align="left"]', lines[2]);
    return {
        teachingWeek,
        locations,
        activityType,
        professor,
    }
}

const dayToOffset: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
};

interface ComputeDateResult {
    start: number;
    end: number;
}
const computeDate = (startTime: DayTime, endTime: DayTime, day: string, weekStart: string): ComputeDateResult => {
    const weekStartDate = new Date(`${weekStart} UTC+0`); // UTC+0 prevent from using local TZ
    const dayOffset = dayToOffset[day];
    if (!dayOffset) {
        throw new Error('Failed to compute date');
    }
    const dayDate = new Date(weekStartDate.setDate(dayOffset - weekStartDate.getDay() + weekStartDate.getDate()));
    return {
        start: dayDate.setUTCHours(startTime.hour, startTime.min),
        end: dayDate.setUTCHours(endTime.hour, endTime.min),
    }
}

type TableCourseInfo = Omit<Course, 'block'>;
const TIMELINE_BODY_SELECTOR='.grid-border-args';
const parseTable = async (table: ElementHandle, weekStart: string): Promise<TableCourseInfo[]> => {
    const rows = await table.$$(`${TIMELINE_BODY_SELECTOR}>tbody>tr`);
    const hours = await parseHoursRow(rows[0]);
    const days = await parseDays(table);
    const results: TableCourseInfo[] = [];

    const rowsData = rows.slice(1);
    for (let y = 0; y < rowsData.length; y++) {
        const row = rowsData[y];
        const columnsData = (await row.$$('td[style]')).slice(1);
        let offsetX = 0;
        for (let x = 0; x < columnsData.length; x++) {
            const cell = columnsData[x];
            if (await cell.evaluate(el => el.getAttribute('class')) !== 'cell-border') {
                let duration: number = Number(await cell.evaluate(el => el.getAttribute('colspan')));
                if (!duration) {
                    duration = 1;
                }
                results.push({
                    ...computeDate(hours[x + offsetX], hours[x + offsetX + duration], days[y], weekStart),
                    detail: await parseCell(cell)
                });
                offsetX += Number(duration) - 1;
            }
        }
    }
    return results;
}

const parseTimeline = async (header: ElementHandle, table: ElementHandle): Promise<Course[]> => {
    const { block, weekStart } = await parseHeader(header);
    const courses = await parseTable(table, weekStart);
    return courses.map(course => ({
        block,
        ...course,
    }));
}

export const parseTimelines = async (page: Page): Promise<Course[]> => {
    const TIMELINE_HEADER_SELECTOR='.header-border-args';
    await page.waitFor(TIMELINE_HEADER_SELECTOR);
    const headers = await page.$$(TIMELINE_HEADER_SELECTOR);
    const tables = await page.$$(TIMELINE_BODY_SELECTOR);
    let result: Course[] = [];
    for (let i = 0; i < headers.length && i < tables.length; i++) {
        result = result.concat(await parseTimeline(headers[i], tables[i]));
    }
    return result;
}
