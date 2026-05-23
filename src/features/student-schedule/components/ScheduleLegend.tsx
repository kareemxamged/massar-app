import { useTranslation } from 'react-i18next';
import styles from '../../../pages/student/StudentSchedule.module.css';

export default function ScheduleLegend() {
    const { t, i18n } = useTranslation('common');

    return (
        <div className={styles.legend} style={{ direction: i18n.dir() }}>
            <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: '#3b82f6' }}></div>
                <span className={styles.legendLabel}>{t('studentSchedule.legend.upcoming', 'Upcoming')}</span>
            </div>
            <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: '#10b981' }}></div>
                <span className={styles.legendLabel}>{t('studentSchedule.legend.today', 'Today')}</span>
            </div>
            <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: '#f97316' }}></div>
                <span className={styles.legendLabel}>{t('studentSchedule.legend.completed', 'Completed')}</span>
            </div>
            <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: '#ef4444' }}></div>
                <span className={styles.legendLabel}>{t('studentSchedule.legend.missed', 'Missed / Overdue')}</span>
            </div>
        </div>
    );
}
