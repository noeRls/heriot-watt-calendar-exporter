import { launch, Browser, Page } from 'puppeteer';
import { sleep } from '../utils';

let browser: Browser = null;
let maxPage: number = 10;
let loading: boolean = false;
let pageNb = 0;
export const getPage = async (): Promise<Page> => {
    pageNb += 1;
    if (!browser) {
        loading = true;
        browser = await launch({
            args: [
                // Required for Docker version of Puppeteer
                '--no-sandbox',
                '--disable-setuid-sandbox',
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                '--disable-dev-shm-usage',
              ],
        });
        loading = false;
    }
    if (browser && loading) {
        while (loading) {
            await sleep(50);
        }
    }
    while ((await browser.pages()).length >= maxPage) {
        await sleep(50);
    }
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.setViewport({
        height: 1080,
        width: 1920,
    });
    return page;
};

export const setMaxPage = (nb: number) => {
    maxPage = nb;
};

export const releasePage = async (page: Page) => {
    const context = await page.browserContext();
    await page.close();
    await context.close();
    pageNb -= 1;
    if (browser && pageNb === 0) {
        const bcpBrowser = browser;
        browser = null;
        await bcpBrowser.close();
    }
};