import { getCoursesOptions, login, goToRowCoursesPage, goToStudendGroupCoursesPage } from "./hw/heriot-watt";
import { writeFileSync } from "fs";
import { releasePage } from "./hw/puppeteerProvider";

const generateOptions = async () => {
    console.log('starting...');
    const page = await login();
    await goToRowCoursesPage(page);
    console.log('getting courses options...');
    const courses = await getCoursesOptions(page);
    writeFileSync('./generated/coursesOption.json', JSON.stringify(courses));
    await goToStudendGroupCoursesPage(page);
    console.log('getting student group options...');
    const sudentGroups = await getCoursesOptions(page);
    writeFileSync('./generated/studentGroups.json', JSON.stringify(sudentGroups));
    await releasePage(page);
};

generateOptions().catch(console.error);
