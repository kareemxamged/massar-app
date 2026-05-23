import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { examService, Exam } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './StudentSchedule.module.css';

// Feature Components
import ScheduleControls from '../../features/student-schedule/components/ScheduleControls';
import ScheduleCalendarView from '../../features/student-schedule/components/ScheduleCalendarView';
import ScheduleListView from '../../features/student-schedule/components/ScheduleListView';
import ScheduleLegend from '../../features/student-schedule/components/ScheduleLegend';

export default function StudentSchedule() {
    const { t, i18n } = useTranslation('common');
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'month' | 'week' | 'list'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const loadExams = async () => {
            try {
                const data = await examService.getExams();
                setExams(data);
            } catch (err) {
                console.error("Failed to load exams", err);
            } finally {
                setLoading(false);
            }
        };
        loadExams();
    }, []);

    const navigatePeriod = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (view === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const isSameDate = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const getStatus = (exam: Exam) => {
        if (!exam.start_time) return 'upcoming';
        const examDate = new Date(exam.start_time);
        const now = new Date();
        const isSubmitted = exam.submission_status === 'submitted';

        if (isSubmitted) return 'completed';
        if (examDate < now && !isSubmitted) return 'missed';
        if (isSameDate(examDate, now)) return 'today';
        return 'upcoming';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: '#f97316' };
            case 'missed': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' };
            case 'today': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981', border: '#10b981' };
            case 'upcoming': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', border: '#3b82f6' };
            default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#9ca3af', border: '#4b5563' };
        }
    };

    if (loading) return <LoadingSpinner fullScreen text={t('studentSchedule.loading', 'Loading schedule...')} />;

    return (
        <div className={styles.container} style={{ direction: i18n.dir() }}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>{t('studentSchedule.pageTitle', 'Exam Schedule')}</h1>
                <p className={styles.pageSubtitle}>{t('studentSchedule.pageSubtitle', 'Stay organized and never miss an upcoming exam.')}</p>
            </div>

            <ScheduleControls
                view={view}
                setView={setView}
                currentDate={currentDate}
                navigatePeriod={navigatePeriod}
            />

            <div className={`glass-card ${styles.calendarContainer}`}>
                {(view === 'month' || view === 'week') && (
                    <ScheduleCalendarView
                        view={view}
                        exams={exams}
                        currentDate={currentDate}
                        getStatus={getStatus}
                        getStatusColor={getStatusColor}
                    />
                )}
                {view === 'list' && (
                    <ScheduleListView
                        exams={exams}
                        currentDate={currentDate}
                        getStatus={getStatus}
                        getStatusColor={getStatusColor}
                    />
                )}
            </div>

            <ScheduleLegend />
        </div>
    );
}
