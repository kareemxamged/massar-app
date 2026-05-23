import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { examService, Exam } from '../../../services/examService';
import { ExamList } from '../../../features/teacher-exams';
import type { ExamWithSubmissions } from '../../../features/teacher-exams';
import styles from './ManageExams.module.css';
import EditExamModal from './components/EditExamModal';
import SubmissionsModal from './components/SubmissionsModal';

export default function ManageExams() {
    const { t, i18n } = useTranslation('exams');
    const isArabic = i18n.language.startsWith('ar');

    const [exams, setExams] = useState<ExamWithSubmissions[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; examId: number | null; examTitle: string }>({ isOpen: false, examId: null, examTitle: '' });
    const [duplicateModal, setDuplicateModal] = useState<{ isOpen: boolean; examId: number | null; examTitle: string }>({ isOpen: false, examId: null, examTitle: '' });
    const [editModalExamId, setEditModalExamId] = useState<number | null>(null);
    const [submissionsModalExam, setSubmissionsModalExam] = useState<Exam | null>(null);

    const labels = {
        en: {
            deleteModalTitle: t('manageExams.deleteModal.title'),
            deleteModalPre: t('manageExams.deleteModal.messagePre'),
            deleteModalPost: t('manageExams.deleteModal.messagePost'),
            deleteModalCancel: t('manageExams.deleteModal.cancel'),
            deleteModalConfirm: t('manageExams.deleteModal.confirm'),
            duplicateModalTitle: t('manageExams.duplicateModal.title'),
            duplicateModalPre: t('manageExams.duplicateModal.messagePre'),
            duplicateModalPost: t('manageExams.duplicateModal.messagePost'),
            duplicateModalCancel: t('manageExams.duplicateModal.cancel'),
            duplicateModalConfirm: t('manageExams.duplicateModal.confirm'),
        },
        ar: {
            deleteModalTitle: 'حذف الامتحان',
            deleteModalPre: 'هل أنت متأكد من حذف',
            deleteModalPost: '؟',
            deleteModalCancel: 'إلغاء',
            deleteModalConfirm: 'تأكيد الحذف',
            duplicateModalTitle: 'تكرار الامتحان',
            duplicateModalPre: 'هل أنت متأكد من تكرار',
            duplicateModalPost: '؟',
            duplicateModalCancel: 'إلغاء',
            duplicateModalConfirm: 'تأكيد التكرار',
        }
    };

    const txt = isArabic ? labels.ar : labels.en;

    const loadExams = async () => {
        setLoading(true);
        try {
            const data = await examService.getExams();
            setExams(data.map(exam => ({ ...exam, submissions_count: 0 })));
        } catch (error) {
            console.error('Failed to load exams:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, []);

    // --- Handlers ---
    const handleEdit = (examId: number) => {
        setEditModalExamId(examId);
    };

    const handleDelete = (exam: ExamWithSubmissions) => {
        setDeleteModal({ isOpen: true, examId: exam.id, examTitle: exam.title });
    };

    const handleDuplicate = (exam: ExamWithSubmissions) => {
        setDuplicateModal({ isOpen: true, examId: exam.id, examTitle: exam.title });
    };

    const handleSubmissions = (exam: ExamWithSubmissions) => {
        setSubmissionsModalExam(exam as Exam);
    };

    const confirmDuplicate = async () => {
        if (!duplicateModal.examId) return;
        try {
            await examService.duplicateExam(duplicateModal.examId);
            setDuplicateModal({ isOpen: false, examId: null, examTitle: '' });
            loadExams();
        } catch (error) {
            console.error('Error duplicating:', error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.examId) return;
        try {
            await examService.deleteExam(deleteModal.examId);
            setExams(prev => prev.filter(e => e.id !== deleteModal.examId));
            setDeleteModal({ isOpen: false, examId: null, examTitle: '' });
        } catch (error) {
            console.error('Error deleting exam:', error);
        }
    };

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'}>
            <ExamList
                exams={exams}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onSubmissions={handleSubmissions}
            />

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className={styles.modalOverlay} dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconBox}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dangerText}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <h2 className={styles.modalTitle}>{txt.deleteModalTitle}</h2>
                        <p className={styles.modalDesc}>
                            {txt.deleteModalPre} <strong>"{deleteModal.examTitle}"</strong>{txt.deleteModalPost}
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={() => setDeleteModal({ isOpen: false, examId: null, examTitle: '' })}
                            >
                                {txt.deleteModalCancel}
                            </button>
                            <button className={styles.modalDeleteBtn} onClick={confirmDelete}>
                                {txt.deleteModalConfirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Confirmation Modal */}
            {duplicateModal.isOpen && (
                <div className={styles.modalOverlay} dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconBox} style={{ background: 'rgba(96, 165, 250, 0.1)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        </div>
                        <h2 className={styles.modalTitle}>{txt.duplicateModalTitle}</h2>
                        <p className={styles.modalDesc}>
                            {txt.duplicateModalPre} <strong>"{duplicateModal.examTitle}"</strong>{txt.duplicateModalPost}
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={() => setDuplicateModal({ isOpen: false, examId: null, examTitle: '' })}
                            >
                                {txt.duplicateModalCancel}
                            </button>
                            <button className={styles.modalDuplicateBtn} onClick={confirmDuplicate}>
                                {txt.duplicateModalConfirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Exam Modal */}
            {editModalExamId && (
                <EditExamModal
                    examId={editModalExamId}
                    onClose={() => setEditModalExamId(null)}
                    onSuccess={loadExams}
                />
            )}

            {/* Submissions Modal */}
            {submissionsModalExam && (
                <SubmissionsModal
                    exam={submissionsModalExam}
                    onClose={() => setSubmissionsModalExam(null)}
                />
            )}
        </div>
    );
}
