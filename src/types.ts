interface Block {
    title: string;
    id: string;
}

interface CourseDetail {
    title?: string;
    code?: string;
    teachingWeek?: string;
    locations: string[];
    activityType?: string;
    professor?: string;
}

interface Course {
    block: Block;
    start: number;
    end: number;
    detail: CourseDetail;
}
