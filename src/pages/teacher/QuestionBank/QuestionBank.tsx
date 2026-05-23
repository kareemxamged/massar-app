import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Copy, Trash2, Edit, BookOpen, X } from 'lucide-react';
import { questionBankService } from '../../../features/question-bank/api/questionBankService';
import { Question, QuestionFilters, questionTypeLabels, difficultyLabels, difficultyColors } from '../../../features/question-bank/types';
import QuestionFormModal from './components/QuestionFormModal';
import { DeleteConfirmModal } from '../../../features/teacher-courses/components/CourseList/DeleteConfirmModal';
import styles from './QuestionBank.module.css';
import { useTranslation } from 'react-i18next';

export default function QuestionBank() {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<QuestionFilters>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [courses, setCourses] = useState<{ id: number; title: string; code: string }[]>([]);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadQuestions();
        loadCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await questionBankService.getQuestions(filters);
            setQuestions(data);
        } catch (err) {
            console.error('Error loading questions:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const loadCourses = async () => {
        try {
            const data = await questionBankService.getTeacherCourses();
            setCourses(data);
        } catch (err) {
            console.error('Error loading courses:', err);
        }
    };

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search: search || undefined }));
    };

    const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const handleDeleteClick = (question: Question) => {
        setQuestionToDelete(question);
    };

    const handleConfirmDelete = async () => {
        if (!questionToDelete) return;
        setIsDeleting(true);
        try {
            await questionBankService.deleteQuestion(questionToDelete.id);
            loadQuestions();
        } catch (err) {
            console.error('Error deleting question:', err);
        } finally {
            setIsDeleting(false);
            setQuestionToDelete(null);
        }
    };

    const handleDuplicate = async (question: Question) => {
        try {
            await questionBankService.duplicateQuestion(question.id);
            loadQuestions();
        } catch (err) {
            console.error('Error duplicating question:', err);
        }
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleSave = async () => {
        loadQuestions();
        handleModalClose();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getQuestionPreview = (content: string) => {
        return content.length > 150 ? content.substring(0, 150) + '...' : content;
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    return (
        <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isRtl ? 'بنك الأسئلة' : 'Question Bank'}</h1>
                    <p className={styles.subtitle}>{isRtl ? 'إدارة مكتبة الأسئلة الخاصة بك' : 'Manage your question library'}</p>
                </div>
                <button className={styles.addBtn} onClick={handleAddNew}>
                    <Plus size={20} />
                    {isRtl ? 'إضافة سؤال جديد' : 'Add New Question'}
                </button>
            </div>

            {/* Filters */}
            <div className={styles.filtersCard}>
                <div className={styles.searchRow}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={isRtl ? 'ابحث عن الأسئلة...' : 'Search questions...'}
                            value={filters.search || ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={`${styles.searchInput} text-start`}
                        />
                    </div>
                    {hasActiveFilters && (
                        <button className={styles.clearBtn} onClick={clearFilters}>
                            <X size={16} />
                            {isRtl ? 'مسح الفلاتر' : 'Clear Filters'}
                        </button>
                    )}
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.filterGroup}>
                        <Filter size={14} />
                        <select
                            value={filters.course_id || ''}
                            onChange={(e) => handleFilterChange('course_id', e.target.value ? parseInt(e.target.value) : undefined)}
                            className={styles.filterSelect}
                        >
                            <option value="">{isRtl ? 'كل المواد' : 'All Courses'}</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={filters.type || ''}
                            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                            className={styles.filterSelect}
                        >
                            <option value="">{isRtl ? 'كل الأنواع' : 'All Types'}</option>
                            {Object.entries(questionTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {isRtl ? (value === 'multiple_choice' ? 'اختيار من متعدد' : value === 'true_false' ? 'صح وخطأ' : value === 'essay' ? 'مقال' : label) : label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={filters.difficulty || ''}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                            className={styles.filterSelect}
                        >
                            <option value="">{isRtl ? 'كل مستويات الصعوبة' : 'All Difficulties'}</option>
                            {Object.entries(difficultyLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {isRtl ? (value === 'easy' ? 'سهل' : value === 'medium' ? 'متوسط' : value === 'hard' ? 'صعب' : label) : label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>{isRtl ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}</span>
                </div>
            ) : questions.length === 0 ? (
                <div className={styles.emptyState}>
                    <BookOpen size={64} color="#64748b" />
                    <h3>{isRtl ? 'لا توجد أسئلة' : 'No questions found'}</h3>
                    <p>{hasActiveFilters ? (isRtl ? 'حاول تعديل الفلاتر' : 'Try adjusting your filters') : (isRtl ? 'ابدأ في بناء بنك الأسئلة بإضافة أسئلة جديدة' : 'Start building your question bank by adding new questions')}</p>
                    {!hasActiveFilters && (
                        <button className={styles.addBtn} onClick={handleAddNew}>
                            <Plus size={20} />
                            {isRtl ? 'إضافة سؤالك الأول' : 'Add Your First Question'}
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.questionsGrid}>
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            className={styles.questionCard}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.badges}>
                                    <span
                                        className={styles.difficultyBadge}
                                        style={{ background: `${difficultyColors[question.difficulty]}20`, color: difficultyColors[question.difficulty], borderColor: `${difficultyColors[question.difficulty]}40` }}
                                    >
                                        {isRtl ? (question.difficulty === 'easy' ? 'سهل' : question.difficulty === 'medium' ? 'متوسط' : question.difficulty === 'hard' ? 'صعب' : difficultyLabels[question.difficulty]) : difficultyLabels[question.difficulty]}
                                    </span>
                                    <span className={styles.typeBadge}>
                                        {isRtl ? (question.type === 'multiple_choice' ? 'اختيار من متعدد' : question.type === 'true_false' ? 'صح وخطأ' : question.type === 'essay' ? 'مقال' : questionTypeLabels[question.type]) : questionTypeLabels[question.type]}
                                    </span>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleDuplicate(question)}
                                        title={isRtl ? "نسخ" : "Duplicate"}
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleEdit(question)}
                                        title={isRtl ? "تعديل" : "Edit"}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={() => handleDeleteClick(question)}
                                        title={isRtl ? "حذف" : "Delete"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cardContent} dir="auto">
                                <p className={`${styles.questionText} text-start`}>
                                    {getQuestionPreview(question.content)}
                                </p>

                                {question.course && (
                                    <div className={styles.courseInfo}>
                                        <BookOpen size={14} />
                                        {question.course.code} - {question.course.title}
                                    </div>
                                )}

                                {question.tags && question.tags.length > 0 && (
                                    <div className={styles.tags}>
                                        {question.tags.map(tag => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardFooter}>
                                <span className={styles.date}>
                                    {isRtl ? `تمت الإضافة ${formatDate(question.created_at)}` : `Added ${formatDate(question.created_at)}`}
                                </span>
                                {question.options && (
                                    <span className={styles.optionsCount}>
                                        {question.options.length} {isRtl ? 'خيارات' : 'options'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <QuestionFormModal
                    question={editingQuestion}
                    courses={courses}
                    onClose={handleModalClose}
                    onSave={handleSave}
                />
            )}

            {/* Delete Confirmation Modal */}
            {questionToDelete && (
                <DeleteConfirmModal
                    title={isRtl ? 'حذف السؤال' : 'Delete Question'}
                    itemName={getQuestionPreview(questionToDelete.content)}
                    isDeleting={isDeleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setQuestionToDelete(null)}
                />
            )}
        </div>
    );
}
