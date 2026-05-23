import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Save, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { examSchema, ExamFormData } from './types';
import styles from './ExamCreator.module.css';

import Stepper from './components/Stepper';
import Step1Info from './components/Step1Info';
import Step2Builder from './components/Step2Builder';
import Step3Settings from './components/Step3Settings';
import PublishResultModal from './components/PublishResultModal';

export function ExamCreator() {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');

    const STEPS = [
        { id: 1, title: isRtl ? 'معلومات الامتحان' : 'Exam Info' },
        { id: 2, title: isRtl ? 'بناء الأسئلة' : 'Question Builder' },
        { id: 3, title: isRtl ? 'الإعدادات والنشر' : 'Settings & Publish' }
    ];

    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [publishResult, setPublishResult] = useState<{
        isSuccess: boolean;
        examTitle?: string;
        errorMessage?: string;
    }>({ isSuccess: false });

    const methods = useForm<ExamFormData>({
        resolver: zodResolver(examSchema),
        defaultValues: {
            title: '',
            subject: '',
            status: 'upcoming',
            duration_minutes: 30,
            passing_score: 50,
            is_randomized: false,
            allow_review: true,
            show_correct_answers: true,
            questions: [
                { text: '', type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1, explanation: '' }
            ],
            target_group: '',
            target_student_ids: []
        },
        mode: 'onTouched'
    });

    const { handleSubmit, trigger, formState: { errors }, getValues } = methods;

    const handlePublishClick = async () => {
        const isValid = await trigger();
        if (!isValid) {
            const errorMessages = Object.keys(errors).map(key => {
                const error = errors[key as keyof typeof errors];
                if (error?.message) return error.message;
                if (key === 'questions' && errors.questions?.root) {
                    return errors.questions.root.message;
                }
                return null;
            }).filter(Boolean);

            toast.error(errorMessages[0] || (isRtl ? 'الرجاء ملء كافة الحقول المطلوبة' : 'Please fill in all required fields'));
            return;
        }
        handleSubmit((data) => onPublish(data as ExamFormData))();
    };

    const nextStep = async () => {
        let fieldsToValidate: string[] = [];

        if (currentStep === 1) {
            fieldsToValidate = ['title', 'subject'];
            const isStepValid = await trigger(fieldsToValidate as any);
            if (isStepValid) {
                setCurrentStep(prev => Math.min(prev + 1, 3));
                window.scrollTo(0, 0);
            } else {
                toast.error(isRtl ? 'الرجاء ملء كافة الحقول المطلوبة' : 'Please fill in all required fields');
            }
        } else if (currentStep === 2) {
            const questions = getValues('questions') || [];

            if (questions.length === 0) {
                toast.error(isRtl ? 'الرجاء إضافة سؤال واحد على الأقل' : 'Please add at least one question');
                return;
            }

            const questionFields: string[] = [];
            questions.forEach((_, index) => {
                questionFields.push(`questions.${index}.text`);
                questionFields.push(`questions.${index}.correct_answer`);
                questionFields.push(`questions.${index}.marks`);
            });

            const isStepValid = await trigger(questionFields as any);
            if (isStepValid) {
                setCurrentStep(prev => Math.min(prev + 1, 3));
                window.scrollTo(0, 0);
            } else {
                toast.error(isRtl ? 'الرجاء تصحيح الأخطاء في الأسئلة' : 'Please fix the errors in your questions');
            }
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const onPublish = async (data: ExamFormData) => {
        setIsSubmitting(true);
        setShowModal(true);
        setPublishResult({ isSuccess: false });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            const tutorName = profile?.full_name || user.email?.split('@')[0] || 'Teacher';

            const totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

            const examRecord = {
                title: data.title,
                subject: data.subject,
                description: data.description,
                course_id: data.course_id || null,
                start_time: data.start_time ? new Date(data.start_time).toISOString() : null,
                end_time: data.end_time ? new Date(data.end_time).toISOString() : null,
                duration_minutes: data.duration_minutes,
                passing_score: data.passing_score,
                is_randomized: data.is_randomized,
                total_marks: totalMarks,
                total_questions: data.questions.length,
                status: 'upcoming',
                tutor_name: tutorName,
                allow_review: data.allow_review,
                show_correct_answers: data.show_correct_answers,
                target_group: data.target_group || null,
                target_student_ids: data.target_student_ids && data.target_student_ids.length > 0
                    ? data.target_student_ids
                    : null,
                // Exam is hidden from students until admin approves
                approval_status: 'pending',
                is_published: false,
            };

            const { data: insertedExam, error: examError } = await supabase
                .from('exams')
                .insert([examRecord])
                .select()
                .single();

            if (examError) throw examError;

            const questionsToInsert = data.questions.map(q => ({
                exam_id: insertedExam.id,
                text: q.text,
                type: q.type,
                options: (q.type === 'mcq' || q.type === 'true_false') ? q.options?.filter(Boolean) : null,
                correct_answer: q.correct_answer,
                marks: q.marks,
                image_url: q.image_url || null,
                explanation: q.explanation || null,
            }));

            const { error: questionsError } = await supabase
                .from('questions')
                .insert(questionsToInsert);

            if (questionsError) throw questionsError;

            setPublishResult({ isSuccess: true, examTitle: data.title });
        } catch (error: any) {
            console.error('Failed to publish exam', error);
            setPublishResult({ isSuccess: false, errorMessage: error.message || (isRtl ? 'فشل في نشر الامتحان' : 'Failed to publish exam') });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (publishResult.isSuccess) {
            navigate('/teacher/exams');
        }
    };

    return (
        <FormProvider {...methods}>
            <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutGrid color="#818cf8" size={20} />
                        </div>
                        <div className="text-start">
                            <h2 className={styles.title} style={{ margin: 0 }}>{isRtl ? 'استوديو إنشاء الامتحانات' : 'Exam Creator Studio'}</h2>
                            <p className={styles.subtitle} style={{ margin: 0, marginTop: '4px' }}>{isRtl ? 'صمم تقييمك في 3 خطوات بسيطة' : 'Design your assessment in 3 simple steps'}</p>
                        </div>
                    </div>
                </div>

                <Stepper currentStep={currentStep} steps={STEPS} />

                <div style={{ position: 'relative' }}>
                    {currentStep === 1 && <Step1Info />}
                    {currentStep === 2 && <Step2Builder />}
                    {currentStep === 3 && <Step3Settings />}
                </div>

                <div className={styles.actions}>
                    <div className={styles.stepIndicator}>
                        <span>{isRtl ? 'خطوة' : 'Step'} <span className={styles.current}>{currentStep}</span> {isRtl ? 'من' : 'of'} {STEPS.length}</span>
                        <div className={styles.stepDots}>
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`${styles.stepDot} ${i + 1 === currentStep ? styles.active : ''} ${i + 1 < currentStep ? styles.completed : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.btnGroup}>
                        {currentStep > 1 && (
                            <button type="button" onClick={prevStep} className={`${styles.btn} ${styles.btnOutline}`} disabled={isSubmitting}>
                                {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                                {isRtl ? 'السابق' : 'Previous'}
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button type="button" onClick={nextStep} className={`${styles.btn} ${styles.btnPrimary}`}>
                                {isRtl ? 'التالي' : 'Continue'}
                                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                            </button>
                        ) : (
                            <button type="button" onClick={handlePublishClick} className={`${styles.btn} ${styles.btnPublish}`} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    isRtl ? 'جاري النشر...' : 'Publishing...'
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {isRtl ? 'نشر الامتحان' : 'Publish Exam'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <PublishResultModal
                    isOpen={showModal}
                    isLoading={isSubmitting}
                    isSuccess={publishResult.isSuccess}
                    examTitle={publishResult.examTitle}
                    errorMessage={publishResult.errorMessage}
                    onClose={handleModalClose}
                />
            </div>
        </FormProvider>
    );
}

export default ExamCreator;
