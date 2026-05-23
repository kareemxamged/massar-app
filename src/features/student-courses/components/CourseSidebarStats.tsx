import { useTranslation } from 'react-i18next';
import styles from '../../../pages/student/StudentCourses.module.css';

export default function CourseSidebarStats() {
    const { t, i18n } = useTranslation('common');

    return (
        <div className={styles.sidebar} style={{ direction: i18n.dir() }}>
            <div className={styles.statsCard}>
                <h3 className={styles.statsTitle}>{t('studentCourses.sidebar.generalStats', 'General Stats')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>{t('studentCourses.sidebar.cumulativeGpa', 'Cumulative GPA')}</span>
                        <span className={styles.statValueGreen}>3.45 <span className={styles.statValueSmall}>/ 4.0</span></span>
                    </div>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>{t('studentCourses.sidebar.creditsEarned', 'Credits Earned')}</span>
                        <span className={styles.statValue}>87</span>
                    </div>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>{t('studentCourses.sidebar.creditsRemaining', 'Credits Remaining')}</span>
                        <span className={styles.statValue}>45</span>
                    </div>

                    <div className={styles.degreeProgressBox}>
                        <div className={styles.degreeProgressHeader}>
                            <span className={styles.degreeProgressLabel}>{t('studentCourses.sidebar.degreeProgress', 'Degree Progress')}</span>
                            <span className={styles.degreeProgressValue}>66%</span>
                        </div>
                        <div className={styles.degreeProgressBar}>
                            <div className={styles.degreeProgressFill} style={{ width: '66%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
