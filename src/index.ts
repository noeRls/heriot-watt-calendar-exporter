import * as dotenv from 'dotenv';
import * as puppeteer from 'puppeteer';

dotenv.config();

const HW_URL = "https://timetable.hw.ac.uk/WebTimetables/LiveED/login.aspx";

const login = async (page: puppeteer.Page, username: string, password: string) => {
    const INPUT_USERNAME_SELECTOR='input[name="tUserName"]';
    const INPUT_PASSWORD_SELECTOR='input[name="tPassword"]';

    await page.waitFor(INPUT_USERNAME_SELECTOR);
    await page.$eval(INPUT_USERNAME_SELECTOR, (el, value) => el.value = value, username);
    await page.$eval(INPUT_PASSWORD_SELECTOR, (el, value) => el.value = value, password);
    await page.click('input[name="bLogin"]');
}

const selectCourses = async (page: puppeteer.Page, courses: string[], week: number) => {
    const COURSES_LINK_SELECTOR = 'a[id="LinkBtn_modules"]';
    await page.waitFor(COURSES_LINK_SELECTOR);
    await page.click(COURSES_LINK_SELECTOR);

    const COURSES_SELECTION_SELECTOR = 'select[id="dlObject"]';
    await page.waitFor(COURSES_SELECTION_SELECTOR)
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
            console.log('one click');
        }
    }
    await page.keyboard.up('Control');

    const weekSelection = await page.$('select[id="lbWeeks"]');
    (await weekSelection.$(`option[value="${week.toString().padStart(2, ' ')}"]`)).click();

    await page.click('input[name="bGetTimetable"]');
    await page.waitFor(2000);
}

const getTable = async (username: string, password: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.goto(HW_URL);
    await login(page, username, password)
    await selectCourses(page, ['F21BC', 'F21DL'], 1);
    await page.screenshot({ path: './out.png' });
    await browser.close();
}

const main = async () => {
    if (!process.env['HW_USERNAME'] || !process.env['HW_PWD']) {
        throw new Error('Invalid env');
    }
    await getTable(process.env['HW_USERNAME'], process.env['HW_PWD'])
}

main().catch(console.error);