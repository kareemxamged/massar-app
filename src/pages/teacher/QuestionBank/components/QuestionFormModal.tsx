import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { questionBankService } from '../../../../features/question-bank/api/questionBankService';
import { Question, QuestionType, questionTypeLabels, difficultyLabels } from '../../../../features/question-bank/types';
import styles from './QuestionFormModal.module.css';
import { useTranslation } from 'react-i18next';

const questionSchema = z.object({
    content: z.string().min(1, 'Question content is required'),
    type: z.enum(['multiple_choice', 'true_false', 'essay']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    course_id: z.coerce.number().optional(),
    explanation: z.string().optional(),
    tags: z.string().optional(),
    options: z.array(z.object({
        id: z.string(),
        text: z.string().min(1, 'Option text is required'),
        isCorrect: z.boolean().default(false)
    })).optional(),
    correct_answer: z.string().optional()
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormModalProps {
    question: Question | null;
    courses: { id: number; title: string; code: string }[];
    onClose: () => void;
    onSave: () => void;
}

export default function QuestionFormModal({ question, courses, onClose, onSave }: QuestionFormModalProps) {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!question;

    const {
        register,
        control,
        watch,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<QuestionFormData, unknown, QuestionFormData>({
        resolver: zodResolver(questionSchema) as any,
        defaultValues: {
            content: '',
            type: 'multiple_choice',
            difficulty: 'medium',
            options: [{ id: '1', text: '', isCorrect: false }],
            explanation: '',
            tags: ''
        }
    });

    const { fields, append, remove, update, replace } = useFieldArray({
        control,
        name: 'options'
    });

    const questionType = watch('type');

    useEffect(() => {
        console.log('Loading question for edit:', question);
        if (question) {
            setValue('content', question.content);
            setValue('type', question.type);
            setValue('difficulty', question.difficulty);
            setValue('course_id', question.course_id || undefined);
            setValue('explanation', question.explanation || '');
            setValue('tags', question.tags?.join(', ') || '');
            // For true_false, always create True/False options based on correct_answer
            if (question.type === 'true_false') {
                console.log('Loading true_false, correct_answer:', question.correct_answer);
                const isTrueCorrect = question.correct_answer === 'true';
                console.log('isTrueCorrect:', isTrueCorrect);
                replace([
                    { id: 'true', text: 'True', isCorrect: isTrueCorrect },
                    { id: 'false', text: 'False', isCorrect: !isTrueCorrect }
                ]);
            } else if (question.options && question.options.length > 0) {
                replace((question.options as any[]).map((opt, idx) => {
                    // DB may store options as plain strings (seed data) or as QuestionOption objects
                    if (typeof opt === 'string') {
                        return {
                            id: String(idx + 1),
                            text: opt,
                            isCorrect: opt === question.correct_answer
                        };
                    }
                    return {
                        id: opt.id || String(idx + 1),
                        text: opt.text || '',
                        isCorrect: opt.isCorrect ?? (opt.text === question.correct_answer)
                    };
                }));
            }
            setValue('correct_answer', question.correct_answer || '');
        }
    }, [question, setValue, replace]);

    // Reset options when type changes (only for new questions, not when editing)
    useEffect(() => {
        // Skip if editing an existing question
        if (question) return;

        if (questionType === 'true_false') {
            setValue('options', [
                { id: 'true', text: 'True', isCorrect: false },
                { id: 'false', text: 'False', isCorrect: false }
            ]);
        } else if (questionType === 'multiple_choice' && (!fields.length || fields[0].id === 'true')) {
            setValue('options', [
                { id: '1', text: '', isCorrect: false },
                { id: '2', text: '', isCorrect: false }
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionType, setValue, question]);

    const onSubmit = async (data: QuestionFormData) => {
        console.log('Form submitted with data:', data);
        console.log('Options for true_false:', data.options);
        try {
            setIsSubmitting(true);

            let correctAnswer = '';
            if (data.type === 'true_false' && data.options) {
                const selectedOption = data.options.find(o => o.isCorrect);
                console.log('Selected option for true_false:', selectedOption);
                // Check the text of the selected option to determine true/false
                correctAnswer = selectedOption?.text?.toLowerCase() === 'true' ? 'true' : 'false';
                console.log('Setting correct_answer to:', correctAnswer);
            }

            const request = {
                content: data.content,
                type: data.type,
                difficulty: data.difficulty,
                course_id: data.course_id,
                explanation: data.explanation,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                ...(data.type === 'multiple_choice' && data.options && data.options.length > 0 && {
                    options: data.options,
                    correct_answer: data.options.find(o => o.isCorrect)?.text || ''
                }),
                ...(data.type === 'essay' && {
                    correct_answer: data.correct_answer
                })
            };
            console.log('Request being sent:', request);

            if (isEditing && question) {
                const result = await questionBankService.updateQuestion({ id: question.id, ...request });
                console.log('Update result:', result);
            } else {
                const result = await questionBankService.createQuestion(request);
                console.log('Create result:', result);
            }

            onSave();
        } catch (err) {
            console.error('Error saving question:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
        const currentOption = fields[index];
        if (field === 'text') {
            update(index, { ...currentOption, text: value as string });
        } else {
            // For single choice, uncheck others
            if (questionType === 'multiple_choice' || questionType === 'true_false') {
                fields.forEach((opt, idx) => {
                    update(idx, { ...opt, isCorrect: idx === index });
                });
            } else {
                update(index, { ...currentOption, isCorrect: value as boolean });
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? (isRtl ? 'تعديل السؤال' : 'Edit Question') : (isRtl ? 'إضافة سؤال جديد' : 'Add New Question')}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    {/* Question Type */}
                    <div className={styles.formGroup}>
                        <label className="text-start">{isRtl ? 'نوع السؤال' : 'Question Type'}</label>
                        <div className={styles.typeButtons}>
                            {Object.entries(questionTypeLabels).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`${styles.typeBtn} ${questionType === value ? styles.typeBtnActive : ''}`}
                                    onClick={() => setValue('type', value as QuestionType)}
                                >
                                    {isRtl ? (value === 'multiple_choice' ? 'اختيار من متعدد' : value === 'true_false' ? 'صح وخطأ' : value === 'essay' ? 'مقال' : label) : label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Course & Difficulty */}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className="text-start">{isRtl ? 'المادة (اختياري)' : 'Course (Optional)'}</label>
                            <select {...register('course_id')} className={`${styles.select} text-start`}>
                                <option value="">{isRtl ? 'اختر المادة...' : 'Select a course...'}</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className="text-start">{isRtl ? 'مستوى الصعوبة' : 'Difficulty'}</label>
                            <select {...register('difficulty')} className={`${styles.select} text-start`}>
                                {Object.entries(difficultyLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {isRtl ? (value === 'easy' ? 'سهل' : value === 'medium' ? 'متوسط' : value === 'hard' ? 'صعب' : label) : label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className={styles.formGroup}>
                        <label className="text-start">{isRtl ? 'محتوى السؤال *' : 'Question Content *'}</label>
                        <textarea
                            {...register('content')}
                            rows={4}
                            placeholder={isRtl ? 'اكتب سؤالك هنا...' : 'Enter your question here...'}
                            className={`${styles.textarea} text-start`}
                        />
                        {errors.content && <span className={styles.error}>{errors.content.message}</span>}
                    </div>

                    {/* Options for MCQ and True/False */}
                    {(questionType === 'multiple_choice' || questionType === 'true_false') && (
                        <div className={styles.formGroup}>
                            <label className="text-start">{isRtl ? 'الخيارات *' : 'Options *'}</label>
                            <div className={styles.optionsList}>
                                {fields.map((field, index) => (
                                    <div key={field.id} className={styles.optionRow}>
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={field.isCorrect}
                                            onChange={() => handleOptionChange(index, 'isCorrect', true)}
                                            className={styles.radio}
                                            title={isRtl ? 'تحديد كإجابة صحيحة' : 'Mark as correct answer'}
                                        />
                                        <input
                                            type="text"
                                            value={field.text}
                                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                            placeholder={isRtl ? `الخيار ${index + 1}` : `Option ${index + 1}`}
                                            className={`${styles.optionInput} text-start`}
                                            readOnly={questionType === 'true_false'}
                                        />
                                        {questionType === 'multiple_choice' && fields.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className={styles.removeOptionBtn}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {questionType === 'multiple_choice' && (
                                <button
                                    type="button"
                                    onClick={() => append({ id: String(fields.length + 1), text: '', isCorrect: false })}
                                    className={styles.addOptionBtn}
                                >
                                    <Plus size={16} className={isRtl ? "ms-0 me-2" : "ms-2 me-0"} />
                                    {isRtl ? 'إضافة خيار' : 'Add Option'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Correct Answer for Essay / Subjective */}
                    {questionType === 'essay' && (
                        <div className={styles.formGroup}>
                            <label className="text-start">{isRtl ? 'الإجابة الصحيحة (للمرجعية - اختياري)' : 'Correct Answer (Optional - for reference)'}</label>
                            <textarea
                                {...register('correct_answer')}
                                rows={3}
                                placeholder={isRtl ? 'اكتب الإجابة المتوقعة (كمرجع)...' : 'Enter the expected answer (for reference)'}
                                className={`${styles.textarea} text-start`}
                            />
                        </div>
                    )}

                    {/* Explanation */}
                    <div className={styles.formGroup}>
                        <label className="text-start">{isRtl ? 'الشرح (اختياري)' : 'Explanation (Optional)'}</label>
                        <textarea
                            {...register('explanation')}
                            rows={3}
                            placeholder={isRtl ? 'اشرح الإجابة...' : 'Explain the answer...'}
                            className={`${styles.textarea} text-start`}
                        />
                    </div>

                    {/* Tags */}
                    <div className={styles.formGroup}>
                        <label className="text-start">{isRtl ? 'الوسوم (اختياري)' : 'Tags (Optional)'}</label>
                        <input
                            type="text"
                            {...register('tags')}
                            placeholder={isRtl ? 'أدخل الوسوم مفصولة بفواصل (مثال: جبر، معادلات)' : 'Enter tags separated by commas (e.g., algebra, equations)'}
                            className={`${styles.input} text-start`}
                        />
                    </div>

                    {/* Actions */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                            disabled={isSubmitting}
                        >
                            {isRtl ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isEditing ? (isRtl ? 'تحديث السؤال' : 'Update Question') : (isRtl ? 'حفظ السؤال' : 'Save Question'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
