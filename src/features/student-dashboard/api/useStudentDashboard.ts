import { useState, useEffect } from 'react';
import { DashboardStats, EnrolledCourse, UpcomingTask, Announcement } from '../types';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../services/supabase';

interface StudentDashboardData {
    stats: DashboardStats;
    enrolledCourses: EnrolledCourse[];
    upcomingTasks: UpcomingTask[];
    recentAnnouncements: Announcement[];
}

export function useStudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setLoading(true);

            try {
                // 1. Fetch Enrolled Courses using direct join
                const { data: enrollmentsData, error: enrollError } = await supabase
                    .from('enrollments')
                    .select(`
                        course_id,
                        courses:course_id (
                            id,
                            title,
                            teacher_id,
                            instructor
                        )
                    `)
                    .eq('student_id', user.id)
                    .eq('status', 'enrolled');

                if (enrollError) throw enrollError;

                let enrolledCourses: EnrolledCourse[] = [];
                if (enrollmentsData && enrollmentsData.length > 0) {
                    enrolledCourses = enrollmentsData
                        .filter(e => e.courses)
                        .map(e => {
                            const c: any = Array.isArray(e.courses) ? e.courses[0] : e.courses;
                            return {
                                id: c.id.toString(),
                                courseId: c.id,
                                title: c.title,
                                // some seeds set instructor text, some set teacher_id
                                teacherName: c.instructor || 'أستاذ المادة',
                                progress: 0,
                                lastAccessed: new Date().toISOString(),
                            };
                        });
                }

                // 2. Fetch Upcoming Tasks (Exams for enrolled courses)
                let upcomingTasks: UpcomingTask[] = [];
                if (enrolledCourses.length > 0) {
                    const courseIds = enrolledCourses.map(c => c.courseId);
                    const { data: examsData } = await supabase
                        .from('exams')
                        .select('id, title, course_id, start_time')
                        .in('course_id', courseIds)
                        .gt('start_time', new Date().toISOString())
                        .order('start_time', { ascending: true })
                        .limit(5);

                    if (examsData) {
                        upcomingTasks = examsData.map(e => {
                            const courseTitle = enrolledCourses.find(c => c.courseId === e.course_id)?.title || '';
                            return {
                                id: e.id.toString(),
                                examId: e.id,
                                title: e.title,
                                courseTitle,
                                dueDate: e.start_time || new Date().toISOString(),
                                type: 'exam'
                            };
                        });
                    }
                }

                // 3. Stats calculation
                const { data: submissionsData } = await supabase
                    .from('submissions')
                    .select('score, status')
                    .eq('student_id', user.id);

                // Count how many are actually finished
                const completedExamsList = submissionsData?.filter(sub => sub.status === 'submitted') || [];
                const completedExams = completedExamsList.length;
                const totalScore = completedExamsList.reduce((acc, curr) => acc + (curr.score || 0), 0);
                const averageScore = completedExams > 0 ? Math.round(totalScore / completedExams) : 0;

                const stats: DashboardStats = {
                    coursesInProgress: enrolledCourses.length,
                    completedExams,
                    averageScore,
                };

                // 4. Announcements
                let recentAnnouncements: Announcement[] = [];
                const { data: announcementsData } = await supabase
                    .from('announcements')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (announcementsData) {
                    recentAnnouncements = announcementsData.map(a => ({
                        id: a.id.toString(),
                        title: a.title,
                        content: a.content,
                        date: a.created_at,
                        isRead: false,
                    }));
                }

                setData({
                    stats,
                    enrolledCourses,
                    upcomingTasks,
                    recentAnnouncements
                });
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);

                // Fallback safe state
                setData({
                    stats: { coursesInProgress: 0, completedExams: 0, averageScore: 0 },
                    enrolledCourses: [],
                    upcomingTasks: [],
                    recentAnnouncements: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    return { ...data, loading };
}
