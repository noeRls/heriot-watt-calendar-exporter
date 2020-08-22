import { login } from './hw/heriot-watt';
import { releasePage } from './hw/puppeteerProvider';
import { Page } from 'puppeteer';

if (!process.env['HW_USERNAME'] || !process.env['HW_PWD']) {
    console.error('Invalid env missing HW_USERNAME or HW_PWD');
}

export async function withLogin<T>(cb: (page: Page) => Promise<T>): Promise<T> {
    const page = await login(process.env['HW_USERNAME'], process.env['HW_PWD']);
    const result = await cb(page);
    await releasePage(page);
    return result;
}