import * as dotenv from 'dotenv';
dotenv.config();
import { getCourses, login } from './heriot-watt';
import { releasePage } from './puppeteerProvider';

const main = async () => {
    if (!process.env['HW_USERNAME'] || !process.env['HW_PWD']) {
        throw new Error('Invalid env');
    }
    const page = await login(process.env['HW_USERNAME'], process.env['HW_PWD']);
    await getCourses(page);
    await releasePage(page);
}

main().catch(console.error);
