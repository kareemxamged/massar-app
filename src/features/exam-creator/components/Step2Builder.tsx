import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Sparkles, Plus, AlertCircle, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExamFormData } from '../types';
import QuestionCard from './QuestionCard';
import QuestionBankPicker from './QuestionBankPicker';
import AIQuestionGenerator from './AIQuestionGenerator';
import { Question } from '../../../features/question-bank/types';
import type { GeneratedQuestion } from '../../../features/ai-question-generator/types';
import styles from '../ExamCreator.module.css';
import { toast } from 'react-hot-toast';

export function Step2Builder() {
    const { t, i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');
    const { control, watch, formState: { errors } } = useFormContext<ExamFormData>();
    const [showPicker, setShowPicker] = useState(false);
    const [showAIGenerator, setShowAIGenerator] = useState(false);

    const labels = {
        en: {
            title: t('editExamModal.form.step2.title'),
            subtitle: t('editExamModal.form.step2.subtitle'),
            fromBank: t('editExamModal.form.step2.fromBank'),
            aiGenerate: t('editExamModal.form.step2.aiGenerate'),
            noQuestionsTitle: t('editExamModal.form.step2.noQuestionsTitle'),
            noQuestionsHint: t('editExamModal.form.step2.noQuestionsHint'),
            addManually: t('editExamModal.form.step2.addManually'),
            importFromBank: t('editExamModal.form.step2.importFromBank'),
            aiDefaults: t('editExamModal.form.step2.aiDefaults'),
            addAnother: t('editExamModal.form.step2.addAnother'),
            addedAi: (c: number) => `Added ${c} AI-generated questions! 🤖`,
            addedBank: (c: number) => `Added ${c} question${c !== 1 ? 's' : ''} from Question Bank`
        },
        ar: {
            title: 'خطوات بناء الأسئلة',
            subtitle: 'قم بإضافة أو تعديل الأسئلة',
            fromBank: 'استيراد من بنك الأسئلة',
            aiGenerate: 'توليد بالذكاء الاصطناعي',
            noQuestionsTitle: 'لا توجد أسئلة',
            noQuestionsHint: 'أضف أسئلة للبدء في تجهيز الامتحان',
            addManually: 'إضافة يدوياً',
            importFromBank: 'من البنك',
            aiDefaults: 'نماذج ذكية',
            addAnother: 'إضافة سؤال آخر',
            addedAi: (c: number) => `تمت إضافة ${c} أسئلة ذكية! 🤖`,
            addedBank: (c: number) => `تمت إضافة ${c} سؤال من البنك`
        }
    };
    const txt = isRtl ? labels.ar : labels.en;

    useEffect(() => {
        console.log('showAIGenerator changed:', showAIGenerator);
    }, [showAIGenerator]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questions'
    });

    const addQuestion = () => {
        append({
            text: '',
            type: 'mcq',
            options: ['', '', '', ''],
            correct_answer: '',
            marks: 1,
            image_url: null,
            explanation: '',
        });
    };

    const handleAIGeneration = () => {
        console.log('AI button clicked, opening AI generator modal');
        setShowAIGenerator(true);
    };

    const handleAIQuestionsGenerated = (questions: GeneratedQuestion[]) => {
        questions.forEach(q => {
            append({
                text: q.text,
                type: q.type,
                options: q.options || [],
                correct_answer: q.correct_answer,
                marks: q.marks,
                image_url: null,
                explanation: q.explanation || '',
            });
        });

        toast.success(txt.addedAi(questions.length));
        setShowAIGenerator(false);
    };

    const handleImportFromBank = () => {
        setShowPicker(true);
    };

    const handleSelectQuestions = (selectedQuestions: Question[]) => {
        selectedQuestions.forEach(q => {
            let options: string[] = [];
            let correctAnswer = '';
            let type: 'mcq' | 'true_false' | 'essay' | 'short_answer' = 'mcq';

            if (q.type === 'multiple_choice' && q.options) {
                // DB may store options as string[] (seed data) or QuestionOption[] (form-created)
                const rawOptions = q.options as any[];
                options = rawOptions.map(opt => typeof opt === 'string' ? opt : (opt.text || ''));
                correctAnswer = typeof rawOptions[0] === 'string'
                    ? q.correct_answer || ''
                    : rawOptions.find((opt: any) => opt.isCorrect)?.text || q.correct_answer || '';
                type = 'mcq';
            } else if (q.type === 'true_false') {
                options = ['True', 'False'];
                correctAnswer = q.correct_answer === 'true' ? 'True' : 'False';
                type = 'true_false';
            } else if (q.type === 'essay') {
                type = 'essay';
            } else {
                type = 'short_answer';
                correctAnswer = q.correct_answer || '';
            }

            append({
                text: q.content,
                type,
                options,
                correct_answer: correctAnswer,
                marks: 1,
                image_url: null,
                explanation: q.explanation || '',
            });
        });

        toast.success(txt.addedBank(selectedQuestions.length), { icon: '📚' });
    };

    return (
        <div className={styles.formArea} dir={isRtl ? 'rtl' : 'ltr'}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', flexDirection: 'row' }}>
                <div>
                    <h3 className={styles.title} style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{txt.title}</h3>
                    <p className={styles.subtitle} style={{ margin: 0, fontSize: '0.85rem' }}>{txt.subtitle}</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'row' }}>
                    <button type="button" onClick={handleImportFromBank} className={styles.bankBtn} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isRtl ? <>{txt.fromBank} <BookOpen size={14} /></> : <><BookOpen size={14} /> {txt.fromBank}</>}
                    </button>
                    <button type="button" onClick={handleAIGeneration} className={styles.aiBtn} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isRtl ? <>{txt.aiGenerate} <Sparkles size={14} /></> : <><Sparkles size={14} /> {txt.aiGenerate}</>}
                    </button>
                </div>
            </div>

            {errors.questions?.message && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} /> {errors.questions.message as string}
                </div>
            )}

            {fields.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Plus size={24} color="#818cf8" />
                    </div>
                    <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1rem' }}>{txt.noQuestionsTitle}</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{txt.noQuestionsHint}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                        <button type="button" onClick={addQuestion} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}>
                            {txt.addManually}
                        </button>
                        <button type="button" onClick={handleImportFromBank} className={styles.bankBtn} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isRtl ? <>{txt.importFromBank} <BookOpen size={14} /></> : <><BookOpen size={14} /> {txt.importFromBank}</>}
                        </button>
                        <button type="button" onClick={handleAIGeneration} className={styles.aiBtn} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isRtl ? <>{txt.aiDefaults} <Sparkles size={14} /></> : <><Sparkles size={14} /> {txt.aiDefaults}</>}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {fields.map((field, index) => (
                        <QuestionCard
                            key={field.id}
                            index={index}
                            remove={remove}
                        />
                    ))}

                    <button type="button" onClick={addQuestion} className={styles.btnOutline} style={{ width: '100%', padding: '1rem', justifyContent: 'center', borderStyle: 'dashed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isRtl ? <>{txt.addAnother} <Plus size={18} /></> : <><Plus size={18} /> {txt.addAnother}</>}
                    </button>
                </div>
            )}

            {showPicker && (
                <QuestionBankPicker
                    onSelectQuestions={handleSelectQuestions}
                    onClose={() => setShowPicker(false)}
                />
            )}

            {showAIGenerator && (
                <AIQuestionGenerator
                    courseId={watch('course_id') || undefined}
                    onQuestionsGenerated={handleAIQuestionsGenerated}
                    onClose={() => setShowAIGenerator(false)}
                />
            )}
        </div>
    );
}

export default Step2Builder;
