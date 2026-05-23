import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from '../ExamCreator.module.css';

interface PublishResultModalProps {
    isOpen: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    examTitle?: string;
    errorMessage?: string;
    onClose: () => void;
}

export function PublishResultModal({
    isOpen,
    isLoading,
    isSuccess,
    examTitle,
    errorMessage,
    onClose,
}: PublishResultModalProps) {
    const { i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');

    const txt = isRtl ? {
        publishing: 'جاري نشر الامتحان...',
        wait: 'يرجى الانتظار بينما نقوم بإنشاء امتحانك.',
        published: 'تم النشر بنجاح!',
        publishedDesc1: 'تم نشر "',
        publishedDesc2: '" بنجاح.',
        access: 'يمكن للطلاب الآن الوصول للامتحان وفقاً للجدول الزمني المحدد.',
        ok: 'حسناً',
        failed: 'فشل النشر',
        errorFallback: 'حدث خطأ غير متوقع.',
        tryAgain: 'يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني إذا استمرت المشكلة.'
    } : {
        publishing: 'Publishing Exam...',
        wait: 'Please wait while we create your exam.',
        published: 'Exam Published!',
        publishedDesc1: '"',
        publishedDesc2: '" has been published successfully.',
        access: 'Students can now access the exam according to your configured schedule.',
        ok: 'OK',
        failed: 'Publishing Failed',
        errorFallback: 'An unexpected error occurred.',
        tryAgain: 'Please try again or contact support if the problem persists.'
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {isLoading ? (
                    <>
                        <div className={styles.modalIconLoading}>
                            <Loader2 className={styles.spinnerIcon} size={48} />
                        </div>
                        <h3 className={styles.modalTitle}>{txt.publishing}</h3>
                        <p className={styles.modalText}>{txt.wait}</p>
                    </>
                ) : isSuccess ? (
                    <>
                        <div className={styles.modalIconSuccess}>
                            <CheckCircle size={48} />
                        </div>
                        <h3 className={styles.modalTitle}>{txt.published}</h3>
                        <p className={styles.modalText}>
                            <strong>{txt.publishedDesc1}{examTitle}{txt.publishedDesc2}</strong>
                        </p>
                        <p className={styles.modalSubtext}>
                            {txt.access}
                        </p>
                        <button onClick={onClose} className={`${styles.btn} ${styles.btnSuccess}`}>
                            {txt.ok}
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.modalIconError}>
                            <XCircle size={48} />
                        </div>
                        <h3 className={styles.modalTitle}>{txt.failed}</h3>
                        <p className={styles.modalText}>{errorMessage || txt.errorFallback}</p>
                        <p className={styles.modalSubtext}>{txt.tryAgain}</p>
                        <button onClick={onClose} className={`${styles.btn} ${styles.btnOutline}`}>
                            {txt.ok}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default PublishResultModal;
