import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Info, BarChart2, Calendar, FileText, Library, Flag, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from '../../../pages/student/StudentCourses.module.css';
import { EnrolledCourse } from '../../../services/courseService';

interface CourseCardProps {
    course: EnrolledCourse;
    onReport: (course: EnrolledCourse) => void;
}

export default function CourseCard({ course, onReport }: CourseCardProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div className={styles.courseCard} style={{ direction: i18n.dir() }}>
            {/* Course Header */}
            <div className={styles.cardHeader}>
                <div className={styles.courseInfo}>
                    <div className={styles.courseIcon}>
                        <BookOpen size={28} color="#8b5cf6" />
                    </div>
                    <div>
                        <h3 className={styles.courseTitle}>{course.title}</h3>
                        <p className={styles.courseMeta}>
                            <span className={styles.courseCode}>{course.code}</span>
                            <span>•</span>
                            <Users size={14} style={{ marginLeft: isRtl ? '0' : '4px', marginRight: isRtl ? '4px' : '0' }} /> {course.instructor}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                    className={styles.viewBtn}
                >
                    {t('studentCourses.card.viewDetails', 'View Details')} {isRtl ? <ArrowLeft size={16} style={{ marginRight: '6px' }} /> : <ArrowRight size={16} style={{ marginLeft: '6px' }} />}
                </button>
            </div>

            {/* Compact 2-Column Grid */}
            <div className={styles.detailsGrid}>

                {/* Left Column: Info & Progress */}
                <div className={styles.detailColumn}>
                    <div className={styles.detailSection}>
                        <h4 className={styles.detailSectionTitle}>
                            <Info size={16} color="var(--primary)" /> {t('studentCourses.card.courseInfo', 'Course Info')}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('studentCourses.card.credits', 'Credits')}:</span> <span className={styles.detailValue}>{course.credits}</span></div>
                            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('studentCourses.card.semester', 'Semester')}:</span> <span className={styles.detailValue}>{course.semester}</span></div>
                            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('studentCourses.card.department', 'Department')}:</span> <span className={styles.detailValue}>{course.department}</span></div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className={styles.progressLabel}>
                            <span className={styles.progressLabelText}>{t('studentCourses.card.courseProgress', 'Course Progress')}</span>
                            <span className={styles.progressLabelValue}>{course.average_score}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${course.average_score}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Performance & Upcoming */}
                <div className={styles.detailColumn}>
                    <div className={styles.detailSection}>
                        <h4 className={styles.detailSectionTitle}>
                            <BarChart2 size={16} color="var(--primary)" /> {t('studentCourses.card.performance', 'Performance')}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('studentCourses.card.examsTaken', 'Exams Taken')}:</span> <span className={styles.detailValue}>{course.exams_taken} / {course.total_exams}</span></div>
                            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('studentCourses.card.averageScore', 'Average Score')}:</span> <span className={styles.detailValueGreen}>{course.average_score}%</span></div>
                        </div>
                    </div>

                    <div className={styles.upcomingBox}>
                        <h4 className={styles.upcomingTitle}>
                            <Calendar size={14} color="#f59e0b" /> {t('studentCourses.card.upcoming', 'Upcoming')}
                        </h4>
                        <div className={styles.upcomingItem}>
                            {course.upcoming_exams && course.upcoming_exams.length > 0 ? (
                                course.upcoming_exams.slice(0, 1).map((event, idx) => (
                                    <span key={idx} style={{ fontSize: '0.85rem' }}>
                                        {event.title} <br /><span className={styles.upcomingDate}>{event.date}</span>
                                    </span>
                                ))
                            ) : (
                                <span style={{ fontSize: '0.85rem' }}>{t('studentCourses.card.noUpcoming', 'No upcoming exams')}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className={styles.actionsFooter}>
                <button
                    className={styles.actionBtn}
                    onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'exams' } })}
                >
                    <FileText size={16} /> {t('studentCourses.card.actions.exams', 'Exams')}
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'grades' } })}
                >
                    <BarChart2 size={16} /> {t('studentCourses.card.actions.grades', 'Grades')}
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'materials' } })}
                >
                    <Library size={16} /> {t('studentCourses.card.actions.materials', 'Materials')}
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => onReport(course)}
                    title={t('studentCourses.card.actions.report', 'Report')}
                    style={{ color: '#fb7185' }}
                >
                    <Flag size={16} /> {t('studentCourses.card.actions.report', 'Report')}
                </button>
            </div>
        </div>
    );
}
