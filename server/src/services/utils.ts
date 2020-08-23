import { login } from './hw/heriot-watt';
import { releasePage } from './hw/puppeteerProvider';
import { Page } from 'puppeteer';

export async function withLogin<T>(cb: (page: Page) => Promise<T>): Promise<T> {
    const page = await login();
    const result = await cb(page);
    await releasePage(page);
    return result;
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}