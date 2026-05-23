import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Clock, FileText, Activity, Layers, CheckCircle, AlertCircle, RefreshCw, Download, User } from 'lucide-react';
import styles from './SubmissionsModal.module.css';
import { examService } from '../../../../services/examService';
import { exportSubmissionsToExcel } from '../../../../features/submission-export/api/exportToExcel';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface SubmissionsModalProps {
    exam: any;
    onClose: () => void;
}

export default function SubmissionsModal({ exam, onClose }: SubmissionsModalProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleViewProfile = (studentId: string) => {
        navigate(`/teacher/students/${studentId}`);
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await examService.getExamSubmissions(exam.id);
            setSubmissions(data || []);
        } catch (err: any) {
            console.error('Failed to load submissions', err);
            setError(err.message || t('submissionsModal.errorTitle'));
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const count = await exportSubmissionsToExcel(submissions, exam.title, exam.total_marks);
        if (count > 0) {
            toast.success(t('submissionsModal.exported', { count }));
        } else {
            toast.error(t('submissionsModal.noGraded'));
        }
    };

    useEffect(() => {
        if (exam?.id) {
            fetchSubmissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exam?.id]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.status === 'submitted');
    const avgScore = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedSubmissions.length)
        : 0;

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div
                className={styles.modalContainer}
            >
                <header className={styles.header}>
                    <div className={styles.titleArea}>
                        <h2>{exam.title}</h2>
                        <div className={styles.statsRow}>
                            <span className={styles.statBadge}>
                                <FileText size={16} />
                                {totalSubmissions} {t('submissionsModal.submissions')}
                            </span>
                            <span className={styles.statBadge}>
                                <Activity size={16} />
                                {t('submissionsModal.avgScore')}: {avgScore} / {exam.total_marks || '?'}
                            </span>
                        </div>
                        <button
                            className={styles.exportBtn}
                            onClick={handleExport}
                            disabled={gradedSubmissions.length === 0}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Download size={16} />
                            {t('submissionsModal.exportExcel')}
                        </button>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label={t('submissionsModal.closeModal')}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.content}>
                    {loading ? (
                        <LoadingSpinner fullScreen={false} text={t('submissionsModal.loading')} />
                    ) : error ? (
                        <div className={styles.emptyState}>
                            <AlertCircle className={styles.emptyIcon} style={{ color: '#ef4444' }} />
                            <h3>{t('submissionsModal.errorTitle')}</h3>
                            <p>{error}</p>
                            <button
                                onClick={fetchSubmissions}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    marginTop: '1rem', padding: '0.6rem 1.2rem',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    color: 'var(--primary)', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: 500
                                }}
                            >
                                <RefreshCw size={14} /> {t('submissionsModal.tryAgain')}
                            </button>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Layers className={styles.emptyIcon} />
                            <h3>{t('submissionsModal.noSubmissions')}</h3>
                            <p>{t('submissionsModal.noSubmissionsHint')}</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t('submissionsModal.table.student')}</th>
                                    <th>{t('submissionsModal.table.startedAt')}</th>
                                    <th>{t('submissionsModal.table.status')}</th>
                                    <th>{t('submissionsModal.table.score')}</th>
                                    <th style={{ textAlign: 'end' }}>{t('submissionsModal.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub: any) => {
                                    const profile = sub.profiles;
                                    const isSubmitted = sub.status === 'submitted';
                                    const pct = exam.total_marks > 0 && isSubmitted
                                        ? Math.round(((sub.score || 0) / exam.total_marks) * 100)
                                        : 0;

                                    return (
                                        <tr key={sub.id}>
                                            <td>
                                                <div
                                                    className={styles.studentCell}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleViewProfile(sub.student_id)}
                                                    title={t('submissionsModal.clickToView')}
                                                >
                                                    <img
                                                        src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=Student&background=random'}
                                                        alt={isRtl ? 'صورة الطالب' : 'Avatar'}
                                                        className={styles.avatar}
                                                    />
                                                    <div>
                                                        <span className={`${styles.studentName} ${styles.clickableName}`}>
                                                            {profile?.full_name || (isRtl ? 'طالب غير معروف' : 'Unknown Student')}
                                                        </span>
                                                        <span className={styles.studentId}>
                                                            {t('submissionsModal.studentIdPrefix')}: {profile?.student_id || (isRtl ? 'غير متاح' : 'N/A')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.studentCell}>
                                                    <Clock size={14} style={{ color: '#64748b' }} />
                                                    <span className={styles.timestamp}>
                                                        {sub.started_at
                                                            ? new Date(sub.started_at).toLocaleString(isRtl ? 'ar-SA' : 'en-US')
                                                            : (isRtl ? 'غير متاح' : 'N/A')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[`status_${sub.status}`]}`}>
                                                    {isSubmitted ? t('submissionsModal.status.graded') : t('submissionsModal.status.inProgress')}
                                                </span>
                                            </td>
                                            <td>
                                                {isSubmitted ? (
                                                    <div className={styles.scoreBox}>
                                                        <span className={styles.scoreVal}>{sub.score} / {exam.total_marks}</span>
                                                        <span className={styles.scorePct}>{pct}%</span>
                                                    </div>
                                                ) : (
                                                    <span className={styles.scorePct}>{t('submissionsModal.status.pending')}</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'end' }}>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.profileBtn}
                                                        onClick={() => handleViewProfile(sub.student_id)}
                                                        title={t('submissionsModal.clickToView')}
                                                    >
                                                        <User size={16} />
                                                        {t('submissionsModal.profileBtn')}
                                                    </button>
                                                    <button
                                                        className={styles.reviewBtn}
                                                        disabled={!isSubmitted}
                                                        style={!isSubmitted ? { opacity: 0.3 } : undefined}
                                                    >
                                                        <CheckCircle size={16} />
                                                        {t('submissionsModal.reviewBtn')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
