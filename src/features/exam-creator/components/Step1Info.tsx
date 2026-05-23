import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabase';
import { ExamFormData } from '../types';
import { useTeacherCourseOptions } from '../../teacher-courses';
import styles from '../ExamCreator.module.css';

export function Step1Info() {
    const { t, i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');
    const { register, watch, formState: { errors } } = useFormContext<ExamFormData>();
    const [teacherId, setTeacherId] = useState<string>();
    const { options: courses } = useTeacherCourseOptions(teacherId);

    const courseId = watch('course_id');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setTeacherId(user.id);
        };
        getUser();
    }, []);

    return (
        <div className={styles.formArea} dir={isRtl ? 'rtl' : 'ltr'}>
            <h3 className={styles.title} style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                {t('editExamModal.form.step1.title')}
            </h3>

            <div className={styles.inputGroup}>
                <label className={`${styles.label} text-start`}>{t('editExamModal.form.step1.examTitle')}</label>
                <input
                    type="text"
                    {...register('title')}
                    placeholder={t('editExamModal.form.step1.examTitlePlaceholder')}
                    className={`${styles.input} text-start`}
                />
                {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
            </div>

            <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                    <label className={`${styles.label} text-start`}>{t('editExamModal.form.step1.subjectArea')}</label>
                    <input
                        type="text"
                        {...register('subject')}
                        placeholder={t('editExamModal.form.step1.subjectPlaceholder')}
                        className={`${styles.input} text-start`}
                    />
                    {errors.subject && <span className={styles.errorText}>{errors.subject.message}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={`${styles.label} text-start`}>{t('editExamModal.form.step1.linkToCourse')}</label>
                    <div className={styles.dropdownWrapper}>
                        <select
                            {...register('course_id', { setValueAs: v => (v === "" || v === undefined) ? null : Number(v) })}
                            className={`${styles.dropdownSelect} text-start`}
                            value={courseId || ""}
                        >
                            <option value="">{t('editExamModal.form.step1.standaloneExam')}</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                            ))}
                        </select>
                        <div className={styles.dropdownIcon}>
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                <label className={`${styles.label} text-start`}>{t('editExamModal.form.step1.description')}</label>
                <textarea
                    {...register('description')}
                    placeholder={t('editExamModal.form.step1.descriptionPlaceholder')}
                    className={`${styles.input} text-start`}
                    rows={4}
                    dir="auto"
                />
            </div>
        </div>
    );
}

export default Step1Info;
