import { useTranslation } from 'react-i18next';
import { Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../../pages/student/StudentSchedule.module.css';

interface ScheduleControlsProps {
    view: 'month' | 'week' | 'list';
    setView: (view: 'month' | 'week' | 'list') => void;
    currentDate: Date;
    navigatePeriod: (direction: 'prev' | 'next') => void;
}

export default function ScheduleControls({ view, setView, currentDate, navigatePeriod }: ScheduleControlsProps) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    // To ensure the calendar displays the current month localized across languages:
    const monthName = currentDate.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { month: 'long' });
    const year = currentDate.getFullYear();
    const day = currentDate.getDate();

    return (
        <div className={`glass-card ${styles.controlsBar}`} style={{ direction: i18n.dir() }}>
            {/* View Toggles */}
            <div className={styles.viewToggleGroup}>
                <button
                    onClick={() => setView('month')}
                    className={`${styles.viewToggleBtn} ${view === 'month' ? styles.viewToggleBtnActive : ''}`}
                >
                    <Calendar size={20} /> {t('studentSchedule.views.month', 'Month')}
                </button>
                <button
                    onClick={() => setView('week')}
                    className={`${styles.viewToggleBtn} ${view === 'week' ? styles.viewToggleBtnActive : ''}`}
                >
                    <List size={20} /> {t('studentSchedule.views.week', 'Week')}
                </button>
                <button
                    onClick={() => setView('list')}
                    className={`${styles.viewToggleBtn} ${view === 'list' ? styles.viewToggleBtnActive : ''}`}
                >
                    <List size={20} /> {t('studentSchedule.views.list', 'List')}
                </button>
            </div>

            {/* Month Navigation */}
            <div className={styles.navGroup} style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <button onClick={() => navigatePeriod('prev')} className={styles.navBtn}>
                    {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <span className={styles.navLabel}>
                    {view === 'week'
                        ? `${t('studentSchedule.nav.weekOf', 'Week of')} ${monthName} ${day}`
                        : `${monthName} ${year}`
                    }
                </span>
                <button onClick={() => navigatePeriod('next')} className={styles.navBtn}>
                    {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
        </div>
    );
}
