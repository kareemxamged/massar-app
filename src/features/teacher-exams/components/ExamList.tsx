import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExamCard } from './ExamCard';
import { ExamFilters, type StatusFilter, type SortOrder } from './ExamFilters';
import { getExamDerivedStatus } from '../utils';
import type { ExamWithSubmissions } from '../types';
import styles from './ExamList.module.css';

interface ExamListProps {
  exams: ExamWithSubmissions[];
  isLoading: boolean;
  onEdit: (examId: number) => void;
  onDelete: (exam: ExamWithSubmissions) => void;
  onDuplicate: (exam: ExamWithSubmissions) => void;
  onSubmissions: (exam: ExamWithSubmissions) => void;
}

export function ExamList({
  exams,
  isLoading,
  onEdit,
  onDelete,
  onDuplicate,
  onSubmissions,
}: ExamListProps) {
  const { t, i18n } = useTranslation('exams');
  const navigate = useNavigate();
  const isRtl = i18n.language.startsWith('ar');

  const labels = {
    en: {
      loading: t('manageExams.loading'),
      title: t('manageExams.title'),
      subtitle: t('manageExams.subtitle'),
      createBtn: t('manageExams.createBtn'),
      noExams: t('manageExams.noExams'),
      noExamsHint: t('manageExams.noExamsHint'),
    },
    ar: {
      loading: 'جاري التحميل...',
      title: 'إدارة الامتحانات',
      subtitle: 'قم بإدارة ومتابعة امتحاناتك وتقييم الطلاب',
      createBtn: 'إنشاء امتحان جديد',
      noExams: 'لا توجد امتحانات',
      noExamsHint: 'لم تقم بإنشاء أي امتحانات حتى الآن.',
    }
  };
  const txt = isRtl ? labels.ar : labels.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const filteredExams = useMemo(() => {
    const filtered = exams.filter((exam) => {
      const matchesSearch =
        (exam.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (exam.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (exam.course_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter !== 'All') {
        const derivedInfo = getExamDerivedStatus(exam);
        if (derivedInfo.label !== statusFilter.replace(' ', '')) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
      const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }, [exams, searchQuery, statusFilter, sortOrder]);

  if (isLoading) {
    return (
      <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={styles.loadingState}>
          <div className={styles.loader}></div>
          <p>{txt.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{txt.title}</h1>
          <p className={styles.subtitle}>{txt.subtitle}</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => navigate('/teacher/create-exam')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isRtl ? (
            <>
              {txt.createBtn}
              <Plus size={18} />
            </>
          ) : (
            <>
              <Plus size={18} />
              {txt.createBtn}
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <ExamFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* Exam List */}
      {filteredExams.length === 0 ? (
        <div className={styles.emptyState}>
          <Globe size={48} className={styles.emptyIcon} />
          <h3>{txt.noExams}</h3>
          <p>{txt.noExamsHint}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              isDropdownOpen={openDropdownId === exam.id}
              onToggleDropdown={() =>
                setOpenDropdownId(openDropdownId === exam.id ? null : exam.id)
              }
              onEdit={() => onEdit(exam.id)}
              onDelete={() => onDelete(exam)}
              onDuplicate={() => onDuplicate(exam)}
              onSubmissions={() => onSubmissions(exam)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
