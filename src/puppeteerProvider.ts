import { launch, Browser, Page } from 'puppeteer'

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let browser: Browser = null;
let maxPage: number = 10;
let loading: boolean = false;
export const getPage = async (): Promise<Page> => {
    if (!browser) {
        loading = true;
        browser = await launch();
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
    const page = await browser.newPage();
    await page.setViewport({
        height: 1080,
        width: 1920,
    });
    return page;
}

export const setMaxPage = (nb: number) => {
    maxPage = nb;
}

export const releasePage = async (page: Page) => {
    await page.close();
    if ((await browser.pages()).length === 0) {
        const bcpBrowser = browser;
        browser = null;
        await bcpBrowser.close();
    }
}