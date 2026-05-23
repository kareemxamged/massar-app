import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft, ArrowRight, Save, LayoutGrid } from 'lucide-react';
import { examService } from '../../../../services/examService';

import { examSchema, ExamFormData } from '../../../../features/exam-creator/types';
import Stepper from '../../../../features/exam-creator/components/Stepper';
import Step1Info from '../../../../features/exam-creator/components/Step1Info';
import Step2Builder from '../../../../features/exam-creator/components/Step2Builder';
import Step3Settings from '../../../../features/exam-creator/components/Step3Settings';

import styles from './EditExamModal.module.css';

interface EditExamModalProps {
    examId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditExamModal({ examId, onClose, onSuccess }: EditExamModalProps) {
    const { t, i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');

    const STEPS = [
        { id: 1, title: t('editExamModal.steps.examInfo') },
        { id: 2, title: t('editExamModal.steps.questionBuilder') },
        { id: 3, title: t('editExamModal.steps.settingsPublish') },
    ];

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const methods = useForm<ExamFormData>({
        resolver: zodResolver(examSchema),
        mode: 'onTouched'
    });

    const { handleSubmit, trigger, reset } = methods;

    useEffect(() => {
        const loadExamData = async () => {
            setIsLoadingData(true);
            try {
                const data = await examService.getExamForEdit(examId);
                reset(data);
            } catch (error: any) {
                console.error('Failed to load exam:', error);
                toast.error(error.message || t('editExamModal.toasts.loadFailed'));
                onClose();
            } finally {
                setIsLoadingData(false);
            }
        };
        loadExamData();
    }, [examId, reset, onClose, t]);

    const nextStep = async () => {
        let fieldsToValidate: string[] = [];
        if (currentStep === 1) {
            fieldsToValidate = ['title', 'subject', 'course_id', 'description'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['questions'];
        }

        const isStepValid = await trigger(fieldsToValidate as any);
        if (isStepValid) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            const scrollContainer = document.getElementById('edit-modal-scroll');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error(t('editExamModal.toasts.fixErrors'));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        const scrollContainer = document.getElementById('edit-modal-scroll');
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onUpdate = async (data: ExamFormData) => {
        setIsSubmitting(true);
        try {
            await examService.updateExam(examId, data);
            toast.success(t('editExamModal.toasts.updateSuccess'));
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update exam', error);
            toast.error(error.message || t('editExamModal.toasts.saveFailed'));
            if (error.message?.includes('started')) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer} dir={isRtl ? 'rtl' : 'ltr'}>


                {/* Modal Header (Fixed) */}
                <div className={`${styles.modalHeader} flex items-center justify-between`}>
                    <div className="flex items-center gap-3 text-start">
                        <div className={styles.iconBox}>
                            <LayoutGrid color="#818cf8" size={20} />
                        </div>
                        <div>
                            <h2 className={styles.title}>{t('editExamModal.title')}</h2>
                            <p className={styles.subtitle}>{t('editExamModal.subtitle')}</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} disabled={isSubmitting}>
                        <X size={24} />
                    </button>
                </div>

                {isLoadingData ? (
                    <div className={styles.loadingWrapper}>
                        <div className={styles.loader}></div>
                        <p>{t('editExamModal.loading')}</p>
                    </div>
                ) : (
                    <FormProvider {...methods}>
                        {/* Scrollable Content Area */}
                        <div id="edit-modal-scroll" className={styles.modalContent}>
                            <Stepper currentStep={currentStep} steps={STEPS} />

                            <div className={styles.stepWrapper}>
                                {currentStep === 1 && <Step1Info />}
                                {currentStep === 2 && <Step2Builder />}
                                {currentStep === 3 && <Step3Settings />}
                            </div>
                        </div>

                        {/* Modal Footer (Fixed) */}
                        <div className={`${styles.modalFooter} flex flex-row items-center justify-between w-full`}>
                            {currentStep > 1 ? (
                                <button type="button" onClick={prevStep} className={`${styles.btnOutline} flex flex-row items-center gap-2`} disabled={isSubmitting}>
                                    {isRtl ? (
                                        <><ArrowRight size={16} /><span>{t('editExamModal.prevStep')}</span></>
                                    ) : (
                                        <><ArrowLeft size={16} /><span>{t('editExamModal.prevStep')}</span></>
                                    )}
                                </button>
                            ) : <div></div>}

                            {currentStep < 3 ? (
                                <button type="button" onClick={nextStep} className={`${styles.btnPrimary} flex flex-row items-center gap-2`}>
                                    {isRtl ? (
                                        <><span>{t('editExamModal.nextStep')}</span><ArrowLeft size={16} /></>
                                    ) : (
                                        <><span>{t('editExamModal.nextStep')}</span><ArrowRight size={16} /></>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit((data) => onUpdate(data as ExamFormData))}
                                    className={`${styles.btnPrimary} ${styles.btnSave} flex flex-row items-center gap-2`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <span>{t('editExamModal.saving')}</span> : <><Save size={16} /><span>{t('editExamModal.completeEdit')}</span></>}
                                </button>
                            )}
                        </div>
                    </FormProvider>
                )}

            </div>
        </div>
    );
}
