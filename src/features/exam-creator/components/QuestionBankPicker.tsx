import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { questionBankService } from '../../../features/question-bank/api/questionBankService';
import { Question, QuestionFilters, difficultyColors, difficultyLabels, questionTypeLabels } from '../../../features/question-bank/types';
import styles from '../ExamCreator.module.css';

interface QuestionBankPickerProps {
    onSelectQuestions: (questions: Question[]) => void;
    onClose: () => void;
}

export function QuestionBankPicker({ onSelectQuestions, onClose }: QuestionBankPickerProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<QuestionFilters>({});

    const { i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');

    const labels = {
        en: {
            title: 'Import from Question Bank',
            searchPlaceholder: 'Search questions...',
            allTypes: 'All Types',
            typeMultiChoice: 'Multiple Choice',
            typeTrueFalse: 'True/False',
            typeEssay: 'Subjective / Essay',
            allDifficulties: 'All Difficulties',
            diffEasy: 'Easy',
            diffMedium: 'Medium',
            diffHard: 'Hard',
            selectAll: (count: number) => `Select All (${count})`,
            selected: (count: number) => `${count} selected`,
            loading: 'Loading questions...',
            noQuestions: 'No questions in your bank',
            goAddFirst: 'Go to Question Bank to add questions first',
            cancel: 'Cancel',
            addBtn: (count: number) => `Add ${count} Question${count !== 1 ? 's' : ''} to Exam`,
        },
        ar: {
            title: 'استيراد من بنك الأسئلة',
            searchPlaceholder: 'ابحث عن الأسئلة...',
            allTypes: 'جميع الأنواع',
            typeMultiChoice: 'اختيار من متعدد',
            typeTrueFalse: 'صواب / خطأ',
            typeEssay: 'إجابة حرة',
            allDifficulties: 'جميع المستويات',
            diffEasy: 'سهل',
            diffMedium: 'متوسط',
            diffHard: 'صعب',
            selectAll: (count: number) => `تحديد الكل (${count})`,
            selected: (count: number) => `تم تحديد ${count}`,
            loading: 'جاري تحميل الأسئلة...',
            noQuestions: 'لا توجد أسئلة في البنك',
            goAddFirst: 'اذهب إلى بنك الأسئلة لإضافة الأسئلة أولاً',
            cancel: 'إلغاء',
            addBtn: (count: number) => `إضافة ${count} سؤال إلى الامتحان`,
        }
    };
    const txt = isRtl ? labels.ar : labels.en;

    useEffect(() => {
        loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const data = await questionBankService.getQuestions(filters);
            setQuestions(data);
        } catch (err) {
            console.error('Error loading questions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === questions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(questions.map(q => q.id)));
        }
    };

    const handleAddSelected = () => {
        const selectedQuestions = questions.filter(q => selectedIds.has(q.id));
        onSelectQuestions(selectedQuestions);
        onClose();
    };

    const getQuestionPreview = (content: string) => {
        return content.length > 120 ? content.substring(0, 120) + '...' : content;
    };

    return (
        <div className={styles.pickerOverlay} onClick={onClose}>
            <div className={styles.pickerModal} onClick={(e) => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={styles.pickerHeader}>
                    <h3>
                        <BookOpen size={20} />
                        {txt.title}
                    </h3>
                    <button className={styles.pickerCloseBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.pickerFilters}>
                    <div className={styles.pickerSearch}>
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder={txt.searchPlaceholder}
                            value={filters.search || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                        />
                    </div>
                    <select
                        value={filters.type || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any || undefined }))}
                    >
                        <option value="">{txt.allTypes}</option>
                        <option value="multiple_choice">{txt.typeMultiChoice}</option>
                        <option value="true_false">{txt.typeTrueFalse}</option>
                        <option value="essay">{txt.typeEssay}</option>
                    </select>
                    <select
                        value={filters.difficulty || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any || undefined }))}
                    >
                        <option value="">{txt.allDifficulties}</option>
                        <option value="easy">{txt.diffEasy}</option>
                        <option value="medium">{txt.diffMedium}</option>
                        <option value="hard">{txt.diffHard}</option>
                    </select>
                </div>

                {/* Selection Info */}
                <div className={styles.pickerInfo}>
                    <label className={styles.pickerSelectAll}>
                        <input
                            type="checkbox"
                            checked={selectedIds.size === questions.length && questions.length > 0}
                            onChange={handleSelectAll}
                        />
                        <span>{txt.selectAll(questions.length)}</span>
                    </label>
                    <span className={styles.pickerCount}>
                        {txt.selected(selectedIds.size)}
                    </span>
                </div>

                {/* Questions List */}
                <div className={styles.pickerList}>
                    {loading ? (
                        <div className={styles.pickerLoading}>
                            <div className={styles.spinner}></div>
                            <span>{txt.loading}</span>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className={styles.pickerEmpty}>
                            <BookOpen size={48} />
                            <p>{txt.noQuestions}</p>
                            <span>{txt.goAddFirst}</span>
                        </div>
                    ) : (
                        questions.map((question) => (
                            <div
                                key={question.id}
                                className={`${styles.pickerItem} ${selectedIds.has(question.id) ? styles.pickerItemSelected : ''}`}
                                onClick={() => handleToggleSelection(question.id)}
                            >
                                <div className={styles.pickerCheckbox}>
                                    {selectedIds.has(question.id) && <Check size={16} />}
                                </div>
                                <div className={styles.pickerContent}>
                                    <div className={styles.pickerBadges}>
                                        <span
                                            className={styles.pickerDifficulty}
                                            style={{ background: `${difficultyColors[question.difficulty]}20`, color: difficultyColors[question.difficulty] }}
                                        >
                                            {difficultyLabels[question.difficulty]}
                                        </span>
                                        <span className={styles.pickerType}>
                                            {questionTypeLabels[question.type]}
                                        </span>
                                        {question.course && (
                                            <span className={styles.pickerCourse}>
                                                {question.course.code}
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.pickerText}>
                                        {getQuestionPreview(question.content)}
                                    </p>
                                    {question.tags && question.tags.length > 0 && (
                                        <div className={styles.pickerTags}>
                                            {question.tags.map(tag => (
                                                <span key={tag} className={styles.pickerTag}>{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div className={styles.pickerActions}>
                    <button className={styles.pickerCancel} onClick={onClose}>
                        {txt.cancel}
                    </button>
                    <button
                        className={styles.pickerAdd}
                        onClick={handleAddSelected}
                        disabled={selectedIds.size === 0}
                    >
                        <Plus size={18} />
                        {txt.addBtn(selectedIds.size)}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuestionBankPicker;
