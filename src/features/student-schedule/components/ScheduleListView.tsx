import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../../../pages/student/StudentSchedule.module.css';
import { Exam } from '../../../services/examService';

interface ScheduleListViewProps {
    exams: Exam[];
    currentDate: Date;
    getStatus: (exam: Exam) => string;
    getStatusColor: (status: string) => { bg: string, text: string, border: string };
}

export default function ScheduleListView({ exams, currentDate, getStatus, getStatusColor }: ScheduleListViewProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    const monthExams = exams.filter(e => {
        if (!e.start_time) return false;
        const d = new Date(e.start_time);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());

    if (monthExams.length === 0) {
        return <div className={styles.listEmpty} style={{ direction: i18n.dir() }}>{t('studentSchedule.list.empty', 'No exams found for this month.')}</div>;
    }

    return (
        <div className={styles.listContainer} style={{ direction: i18n.dir() }}>
            {monthExams.map(exam => {
                const status = getStatus(exam);
                const colors = getStatusColor(status);

                // Parse date relative to today
                const examDate = new Date(exam.start_time!);
                const now = new Date();
                const diffTime = Math.abs(examDate.getTime() - now.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const showCountdown = status === 'upcoming';

                return (
                    <div key={exam.id}
                        onClick={() => navigate(`/student/exams/${exam.id}`)} /* Updated route */
                        className={`glass-card ${styles.listItem}`}
                        style={{ borderLeft: isRtl ? 'none' : `4px solid ${colors.border}`, borderRight: isRtl ? `4px solid ${colors.border}` : 'none' }}
                    >
                        <div className={styles.listItemContent}>
                            <h3 className={styles.listItemTitle}>{exam.title}</h3>
                            <p className={styles.listItemDate}>
                                {examDate.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')} {t('studentSchedule.list.at', 'at')} {examDate.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                {showCountdown && (
                                    <span style={{ margin: '0 10px', color: colors.text, fontWeight: 'bold' }}>
                                        ({t('studentSchedule.list.countdownPrefix', 'in ')}{diffDays}{t('studentSchedule.list.days', ' days')})
                                    </span>
                                )}
                            </p>
                        </div>
                        <span className={styles.statusBadge} style={{ background: colors.bg, color: colors.text }}>
                            {t(`studentSchedule.status.${status.toUpperCase()}`, status.toUpperCase())}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
