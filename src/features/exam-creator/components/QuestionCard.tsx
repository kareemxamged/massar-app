import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trash2, Image as ImageIcon, Plus, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabase';
import { toast } from 'react-hot-toast';
import { ExamFormData } from '../types';
import styles from '../ExamCreator.module.css';

interface QuestionCardProps {
    index: number;
    remove: (index: number) => void;
}

export function QuestionCard({ index, remove }: QuestionCardProps) {
    const { register, watch, setValue } = useFormContext<ExamFormData>();
    const { i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');

    const [isUploading, setIsUploading] = useState(false);

    const qType = watch(`questions.${index}.type`);
    const qImageUrl = watch(`questions.${index}.image_url`);
    const qOptions = watch(`questions.${index}.options`) || [];

    const txt = isRtl ? {
        questionLabel: `سؤال #${index + 1}`,
        removeBtn: 'حذف',
        questionPlaceholder: 'اكتب نص السؤال هنا...',
        imageLabel: 'صورة',
        questionType: 'نوع السؤال',
        typeMultiChoice: 'اختيار متعدد',
        typeTrueFalse: 'صواب / خطأ',
        typeSubjective: 'إجابة حرة',
        points: 'الدرجة',
        answerOptions: 'خيارات الإجابة',
        addOption: 'إضافة خيار',
        correctAnswer: 'الإجابة الصحيحة (مطابقة)',
        selectCorrect: '-- اختر الإجابة الصحيحة --',
        optionLabel: (i: number) => `الخيار ${i + 1}`,
        optionChoice: (letter: string, opt: string) => `${letter}: ${opt}`,
        correctAnswerTF: 'الإجابة الصحيحة',
        selectTF: '-- اختر --',
        trueLbl: 'صحيح',
        falseLbl: 'خطأ',
        explanation: 'الشرح (يظهر بعد الامتحان) - اختياري',
        explanationPlaceholder: 'اشرح لماذا هذه الإجابة صحيحة...',
    } : {
        questionLabel: `Question #${index + 1}`,
        removeBtn: 'Remove',
        questionPlaceholder: 'Enter your question here...',
        imageLabel: 'Image',
        questionType: 'Question Type',
        typeMultiChoice: 'Multiple Choice',
        typeTrueFalse: 'True / False',
        typeSubjective: 'Subjective (Text)',
        points: 'Points',
        answerOptions: 'Answer Options',
        addOption: 'Add Option',
        correctAnswer: 'Correct Answer (Exact Match)',
        selectCorrect: '-- Select Correct Option --',
        optionLabel: (i: number) => `Option ${i + 1}`,
        optionChoice: (letter: string, opt: string) => `Option ${letter}: ${opt}`,
        correctAnswerTF: 'Correct Answer',
        selectTF: '-- Select --',
        trueLbl: 'True',
        falseLbl: 'False',
        explanation: 'Explanation (Shown after exam) - Optional',
        explanationPlaceholder: 'Explain why the answer is correct...',
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.match(/image\/(jpeg|png|gif|webp|svg\+xml)/)) {
            toast.error(isRtl ? 'نوع الملف غير مسموح به.' : 'File type not allowed. Use JPEG, PNG, GIF, WEBP, or SVG.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error(isRtl ? 'حجم الصورة يجب أن يكون أقل من 10 ميغابايت.' : 'Image must be less than 10 MB.');
            return;
        }

        setIsUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('question-images')
                .upload(`public/${fileName}`, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('question-images').getPublicUrl(`public/${fileName}`);
            setValue(`questions.${index}.image_url`, data.publicUrl, { shouldValidate: true });
        } catch (error) {
            console.error('Image upload failed', error);
            toast.error(isRtl ? 'فشل رفع الصورة.' : 'Failed to upload image.');
        } finally {
            setIsUploading(false);
        }
    };

    const addOption = () => {
        setValue(`questions.${index}.options`, [...qOptions, '']);
    };

    const removeOption = (optIndex: number) => {
        setValue(`questions.${index}.options`, qOptions.filter((_, i) => i !== optIndex));
    };

    return (
        <div className={styles.questionCard} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={styles.questionHeader}>
                <h4 style={{ color: 'white', margin: 0 }}>{txt.questionLabel}</h4>
                <button type="button" onClick={() => remove(index)} className={styles.removeBtn}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={14} /> {txt.removeBtn}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Question Text & Image */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <textarea
                            {...register(`questions.${index}.text`)}
                            placeholder={txt.questionPlaceholder}
                            className={`${styles.textarea} text-start`}
                            rows={3}
                            dir="auto"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div className={styles.imageUpload} style={{ border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                        {qImageUrl ? (
                            <>
                                <img src={qImageUrl} alt={isRtl ? 'صورة السؤال' : 'Question media'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    type="button"
                                    onClick={() => setValue(`questions.${index}.image_url`, null)}
                                    style={{ position: 'absolute', top: '4px', insetInlineEnd: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '4px', color: 'white', cursor: 'pointer' }}
                                >
                                    <X size={12} />
                                </button>
                            </>
                        ) : (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                                {isUploading ? <div className={styles.spin}>↻</div> : <ImageIcon size={16} />}
                                <span style={{ fontSize: '0.6rem', marginTop: '2px' }}>{txt.imageLabel}</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Question Config Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className={styles.inputGroup} style={{ flex: '1 1 140px', minWidth: '120px', marginBottom: 0 }}>
                        <label className={styles.label}>{txt.questionType}</label>
                        <div className={styles.dropdownWrapper}>
                            <select {...register(`questions.${index}.type`)} className={styles.dropdownSelect}>
                                <option value="mcq">{txt.typeMultiChoice}</option>
                                <option value="true_false">{txt.typeTrueFalse}</option>
                                <option value="subjective">{txt.typeSubjective}</option>
                            </select>
                            <div className={styles.dropdownIcon}>
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.inputGroup} style={{ flex: '0 0 80px', minWidth: '70px', marginBottom: 0 }}>
                        <label className={styles.label}>{txt.points}</label>
                        <input type="number" {...register(`questions.${index}.marks`, { valueAsNumber: true })} className={styles.input} min="1" />
                    </div>
                </div>

                {/* Options Builder for MCQ */}
                {qType === 'mcq' && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label className={styles.label}>{txt.answerOptions}</label>
                            <button
                                type="button"
                                onClick={addOption}
                                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Plus size={12} /> {txt.addOption}
                            </button>
                        </div>

                        <div className={styles.optionsGrid}>
                            {qOptions.map((_, optIndex) => (
                                <div key={optIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <input
                                            {...register(`questions.${index}.options.${optIndex}`)}
                                            placeholder={txt.optionLabel(optIndex)}
                                            className={`${styles.input} text-start`}
                                            dir="auto"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    {qOptions.length > 2 && (
                                        <button type="button" onClick={() => removeOption(optIndex)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem', marginBottom: 0 }}>
                            <label className={styles.label}>{txt.correctAnswer}</label>
                            <div className={styles.dropdownWrapper}>
                                <select {...register(`questions.${index}.correct_answer`)} className={styles.dropdownSelect}>
                                    <option value="">{txt.selectCorrect}</option>
                                    {qOptions.map((opt, i) => (
                                        opt ? <option key={i} value={opt}>{txt.optionChoice(String.fromCharCode(65 + i), opt)}</option> : null
                                    ))}
                                </select>
                                <div className={styles.dropdownIcon}>
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* True/False Options */}
                {qType === 'true_false' && (
                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label}>{txt.correctAnswerTF}</label>
                        <div className={styles.dropdownWrapper}>
                            <select {...register(`questions.${index}.correct_answer`)} className={styles.dropdownSelect}>
                                <option value="">{txt.selectTF}</option>
                                <option value="True">{txt.trueLbl}</option>
                                <option value="False">{txt.falseLbl}</option>
                            </select>
                            <div className={styles.dropdownIcon}>
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Explanation Field */}
                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>{txt.explanation}</label>
                    <input
                        {...register(`questions.${index}.explanation`)}
                        placeholder={txt.explanationPlaceholder}
                        className={`${styles.input} text-start`}
                        dir="auto"
                    />
                </div>
            </div>
        </div>
    );
}

export default QuestionCard;
