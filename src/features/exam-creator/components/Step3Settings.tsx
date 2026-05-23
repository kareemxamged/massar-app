import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Clock, Shuffle, ShieldCheck, Users, UserPlus, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabase';
import { ExamFormData } from '../types';
import { StudentPickerModal } from './StudentPickerModal';
import styles from '../ExamCreator.module.css';

export function Step3Settings() {
    const { t, i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');
    const { register, watch, setValue, formState: { errors } } = useFormContext<ExamFormData>();
    const [levels, setLevels] = useState<string[]>([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const watchGroup = watch('target_group');
    const watchStudentIds = watch('target_student_ids') || [];
    const watchAllowReview = watch('allow_review');

    const labels = {
        en: {
            title: t('editExamModal.form.step3.title'),
            subtitle: t('editExamModal.form.step3.subtitle'),
            timingSection: t('editExamModal.form.step3.timingSection'),
            startTime: t('editExamModal.form.step3.startTime'),
            startTimeHint: t('editExamModal.form.step3.startTimeHint'),
            endTime: t('editExamModal.form.step3.endTime'),
            endTimeHint: t('editExamModal.form.step3.endTimeHint'),
            duration: t('editExamModal.form.step3.duration'),
            gradingSection: t('editExamModal.form.step3.gradingSection'),
            passingScore: t('editExamModal.form.step3.passingScore'),
            passingScoreHint: t('editExamModal.form.step3.passingScoreHint'),

            targetAcademicLevel: 'Target Academic Level *',
            selectLevel: 'Select a level...',
            specificStudents: 'Specific Students *',
            pickSpecificStudents: 'Pick Specific Students...',
            selectedXStudents: (x: number) => `Selected (${x}) Students`,
            clearSelection: 'Clear Selection',
            visibilityAssignment: 'Visibility & Assignment',
            randomizeQuestions: 'Randomize Questions',
            shuffleQuestions: 'Shuffle question order for each student',
            allowReview: 'Allow Review',
            letRevisit: 'Let students revisit answers after exam',
            showAnswers: 'Show Answers',
            revealAnswers: 'Reveal correct answers in review',
            validationAlert: '* Select at least one: an Academic Level OR specific students to assign this exam.',
            levelHint: 'Select a level OR pick specific students below.',
            studentsHint: 'Select a level above OR pick specific students here.'
        },
        ar: {
            title: 'الإعدادات والنشر',
            subtitle: 'قم بضبط إعدادات الامتحان وإمكانية الرؤية',
            timingSection: 'أوقات الامتحان',
            startTime: 'تاريخ ووقت البدء',
            startTimeHint: 'متى سيبدأ الامتحان؟',
            endTime: 'تاريخ ووقت الانتهاء',
            endTimeHint: 'متى سينتهي الامتحان؟',
            duration: 'المدة (بالدقائق)',
            gradingSection: 'التقييم',
            passingScore: 'درجة النجاح (%)',
            passingScoreHint: 'نسبة الإجابات الصحيحة للنجاح',

            targetAcademicLevel: 'المستوى الأكاديمي المستهدف *',
            selectLevel: 'اختر مستوى...',
            specificStudents: 'طلاب محددون *',
            pickSpecificStudents: 'اختر طلاباً محددين...',
            selectedXStudents: (x: number) => `تم اختيار (${x}) طلاب`,
            clearSelection: 'مسح التحديد',
            visibilityAssignment: 'الرؤية والتعيين',
            randomizeQuestions: 'أسئلة عشوائية',
            shuffleQuestions: 'تبديل ترتيب الأسئلة لكل طالب',
            allowReview: 'السماح بالمراجعة',
            letRevisit: 'السماح للطلاب بمراجعة الإجابات بعد الامتحان',
            showAnswers: 'عرض الإجابات',
            revealAnswers: 'إظهار الإجابات الصحيحة للتوضيح',
            validationAlert: '* تنبيه: يجب اختيار مستوى أكاديمي أو طلاب محددين على الأقل.',
            levelHint: 'اختر مستوى أو حدد طلاب بالأسفل.',
            studentsHint: 'اختر مستوى بالأعلى أو حدد طلاب هنا.'
        }
    };
    const txt = isRtl ? labels.ar : labels.en;

    useEffect(() => {
        if (!watchAllowReview) {
            setValue('show_correct_answers', false);
        }
    }, [watchAllowReview, setValue]);

    useEffect(() => {
        const fetchLevels = async () => {
            const { data } = await supabase.from('academic_levels').select('name').order('display_order');
            if (data) {
                setLevels(data.map(d => d.name).filter(Boolean));
            }
        };
        fetchLevels();
    }, []);

    return (
        <div className={styles.formArea} dir={isRtl ? 'rtl' : 'ltr'}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 className={styles.title} style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>
                    {txt.title}
                </h3>
                <p className={styles.subtitle} style={{ margin: 0 }}>{txt.subtitle}</p>
            </div>

            <div className={styles.formGrid}>

                {/* Timing & Scheduling */}
                <div className={styles.settingsCard}>
                    <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'start', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Clock size={14} color="#818cf8" /> {txt.timingSection}
                    </h4>

                    <div className={styles.inputGroup}>
                        <label className={`${styles.label} text-start`}>{txt.startTime}</label>
                        <input
                            type="datetime-local"
                            {...register('start_time')}
                            className={`${styles.input} ${errors.start_time ? styles.inputError : ''} text-start`}
                            dir="auto"
                        />
                        {errors.start_time && <span className={styles.errorText}>{errors.start_time.message}</span>}
                        {!errors.start_time && <span className="text-start" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{txt.startTimeHint}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={`${styles.label} text-start`}>{txt.endTime}</label>
                        <input
                            type="datetime-local"
                            {...register('end_time')}
                            className={`${styles.input} ${errors.end_time ? styles.inputError : ''} text-start`}
                            dir="auto"
                        />
                        {errors.end_time && <span className={styles.errorText}>{errors.end_time.message}</span>}
                        {!errors.end_time && <span className="text-start" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{txt.endTimeHint}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={`${styles.label} text-start`}>{txt.duration}</label>
                        <input
                            type="number"
                            {...register('duration_minutes', { valueAsNumber: true })}
                            className={`${styles.input} text-start`}
                            min="5"
                            dir="auto"
                        />
                        {errors.duration_minutes && <span className={styles.errorText}>{errors.duration_minutes.message}</span>}
                    </div>
                </div>

                {/* Grading & Behavior */}
                <div className={styles.settingsCard}>
                    <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'start', gap: '0.5rem', marginBottom: '1rem' }}>
                        <ShieldCheck size={14} color="#34d399" /> {txt.gradingSection}
                    </h4>

                    <div className={styles.inputGroup}>
                        <label className={`${styles.label} text-start`}>{txt.passingScore}</label>
                        <input
                            type="number"
                            {...register('passing_score', { valueAsNumber: true })}
                            className={`${styles.input} text-start`}
                            min="1" max="100"
                            dir="auto"
                        />
                        {errors.passing_score && <span className={styles.errorText}>{errors.passing_score.message}</span>}
                        <span className="text-start" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{txt.passingScoreHint}</span>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Shuffle size={14} color="#f59e0b" /> {txt.randomizeQuestions}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                                {txt.shuffleQuestions}
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ position: 'relative' }}>
                                <input type="checkbox" {...register('is_randomized')} style={{ opacity: 0, width: 0, height: 0 }} />
                                <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', transition: '0.3s', position: 'relative' }} className="toggle-bg">
                                    <div style={{ position: 'absolute', top: '2px', insetInlineStart: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }} className="toggle-dot" />
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Allow Review Toggle */}
                    <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} color="#60a5fa" /> {txt.allowReview}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                                {txt.letRevisit}
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ position: 'relative' }}>
                                <input type="checkbox" {...register('allow_review')} style={{ opacity: 0, width: 0, height: 0 }} />
                                <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', transition: '0.3s', position: 'relative' }} className="toggle-bg">
                                    <div style={{ position: 'absolute', top: '2px', insetInlineStart: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }} className="toggle-dot" />
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Show Correct Answers Toggle */}
                    <div style={{
                        marginTop: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                        gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                        opacity: watchAllowReview ? 1 : 0.5, pointerEvents: watchAllowReview ? 'auto' : 'none'
                    }}>
                        <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} color="#34d399" /> {txt.showAnswers}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                                {txt.revealAnswers}
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ position: 'relative' }}>
                                <input type="checkbox" {...register('show_correct_answers')} style={{ opacity: 0, width: 0, height: 0 }} />
                                <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', transition: '0.3s', position: 'relative' }} className="toggle-bg">
                                    <div style={{ position: 'absolute', top: '2px', insetInlineStart: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }} className="toggle-dot" />
                                </div>
                            </div>
                        </label>
                        <style>{`
                            input:checked + .toggle-bg { background: var(--primary) !important; }
                            input:checked + .toggle-bg .toggle-dot { transform: translateX(16px); }
                            [dir="rtl"] input:checked + .toggle-bg .toggle-dot { transform: translateX(-16px); }
                        `}</style>
                    </div>

                </div>

            </div>

            {/* Assignment & Access Section (Full Width Row) */}
            <div className={styles.settingsCard} style={{ marginTop: '1.5rem' }}>
                <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'start', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    <Users size={14} color="#60a5fa" /> {txt.visibilityAssignment}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    <span style={{ color: '#f87171' }}>*</span> {txt.validationAlert}
                </p>

                <div className={styles.formGrid}>
                    {/* Level / Group Selection */}
                    <div className={styles.inputGroup}>
                        <label className={`${styles.label} text-start`}>{txt.targetAcademicLevel}</label>
                        <div className={styles.dropdownWrapper}>
                            <select {...register('target_group')} className={`${styles.dropdownSelect} ${errors.target_group ? styles.inputError : ''} text-start`}>
                                <option value="">{txt.selectLevel}</option>
                                {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                            </select>
                            <div className={styles.dropdownIcon}>
                                <ChevronDown size={18} />
                            </div>
                        </div>
                        {errors.target_group && <span className={styles.errorText}>{errors.target_group.message}</span>}
                        {!errors.target_group && <span className="text-start" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {txt.levelHint}
                        </span>}
                    </div>

                    {/* Specific Student Selection */}
                    <div className={styles.inputGroup}>
                        <label className={`${styles.label} text-start`}>{txt.specificStudents}</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(true)}
                                className={`${styles.input} ${errors.target_group ? styles.inputError : ''}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem',
                                    background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)',
                                    color: 'white', borderRadius: '8px', cursor: 'pointer', width: '100%',
                                    transition: 'all 0.2s', justifyContent: 'center'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = errors.target_group ? '#f87171' : 'rgba(255,255,255,0.2)'}
                            >
                                <UserPlus size={16} color="#818cf8" />
                                {watchStudentIds.length > 0
                                    ? txt.selectedXStudents(watchStudentIds.length)
                                    : txt.pickSpecificStudents}
                            </button>
                            {watchStudentIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setValue('target_student_ids', [])}
                                    style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                                >
                                    {txt.clearSelection}
                                </button>
                            )}
                        </div>
                        <span className="text-start" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            {txt.studentsHint}
                        </span>
                    </div>
                </div>
            </div>

            <StudentPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                levelFilter={watchGroup}
                selectedStudentIds={watchStudentIds}
                onApplySelection={(ids) => setValue('target_student_ids', ids, { shouldDirty: true, shouldValidate: true })}
            />
        </div>
    );
}

export default Step3Settings;
