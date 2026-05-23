import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { courseService, EnrolledCourse } from '../../services/courseService';
import { Loader2, Book } from 'lucide-react';
import styles from './StudentCourses.module.css';
import ReportCourseModal from './ReportCourseModal';

// Feature Components
import CourseControls from '../../features/student-courses/components/CourseControls';
import CourseSidebarStats from '../../features/student-courses/components/CourseSidebarStats';
import CourseList from '../../features/student-courses/components/CourseList';

export default function StudentCourses() {
    const { t, i18n } = useTranslation('common');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSemester, setFilterSemester] = useState('all');
    const [filterDept, setFilterDept] = useState('all');
    const [activeTab, setActiveTab] = useState<'current' | 'past' | 'all'>('current');
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportCourse, setReportCourse] = useState<EnrolledCourse | null>(null);
    const [reportSuccess, setReportSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getEnrolledCourses();
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === 'all' ||
            (activeTab === 'current' && course.enrollment_status === 'enrolled') ||
            (activeTab === 'past' && course.enrollment_status === 'completed');

        const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
        const matchesDept = filterDept === 'all' || course.department === filterDept;

        return matchesSearch && matchesTab && matchesSemester && matchesDept;
    });

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ direction: i18n.dir() }}>
            {reportCourse && (
                <ReportCourseModal
                    courseId={reportCourse.id}
                    courseTitle={reportCourse.title}
                    onClose={() => setReportCourse(null)}
                    onSuccess={() => {
                        setReportCourse(null);
                        setReportSuccess(t('studentCourses.reportSuccess', 'Report submitted successfully. Our team will review it.'));
                        setTimeout(() => setReportSuccess(null), 4000);
                    }}
                />
            )}
            {reportSuccess && (
                <div className="fixed bottom-4 right-4 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium"
                    style={{ background: 'rgba(5,150,105,0.95)', border: '1px solid #059669', direction: i18n.dir() }}>
                    {reportSuccess}
                </div>
            )}

            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <Book style={{ marginLeft: i18n.dir() === 'rtl' ? '8px' : '0', marginRight: i18n.dir() === 'ltr' ? '8px' : '0' }} /> {t('studentCourses.pageTitle', 'My Courses')}
                    </h1>
                    <p className={styles.subtitle}>{t('studentCourses.pageSubtitle', 'Manage your enrolled courses and view details.')}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <CourseControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterSemester={filterSemester}
                setFilterSemester={setFilterSemester}
                filterDept={filterDept}
                setFilterDept={setFilterDept}
            />

            {/* Content Layout */}
            <div className={styles.contentLayout}>

                {/* Main Content */}
                <div className={styles.mainColumn}>
                    {/* Tabs */}
                    <div className={styles.tabsRow}>
                        {['current', 'past', 'all'].map(tab => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as typeof activeTab)}
                                    className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                                >
                                    {t(`studentCourses.tabs.${tab}`, tab)} {t('studentCourses.tabs.courses', 'Courses')} ({courses.filter(c => {
                                        if (tab === 'all') return true;
                                        if (tab === 'current') return c.enrollment_status === 'enrolled';
                                        if (tab === 'past') return c.enrollment_status === 'completed';
                                        return false;
                                    }).length})
                                </button>
                            );
                        })}
                    </div>

                    {/* Course Cards */}
                    <CourseList
                        filteredCourses={filteredCourses}
                        activeTab={activeTab}
                        onReport={setReportCourse}
                    />
                </div>

                {/* Sidebar Stats */}
                <CourseSidebarStats />
            </div>
        </div>
    );
}
