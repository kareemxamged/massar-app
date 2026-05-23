export interface DashboardStats {
    coursesInProgress: number;
    completedExams: number;
    averageScore: number;
}

export interface EnrolledCourse {
    id: string;
    courseId: number;
    title: string;
    teacherName: string;
    progress: number; // 0 - 100
    lastAccessed: string;
}

export interface UpcomingTask {
    id: string;
    examId: number;
    title: string;
    courseTitle: string;
    dueDate: string;
    type: 'exam' | 'assignment';
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    isRead: boolean;
}
