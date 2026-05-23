import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './ExamFilters.module.css';

export type StatusFilter = 'All' | 'Always Available' | 'Active' | 'Upcoming' | 'Expired' | 'Disabled';
export type SortOrder = 'newest' | 'oldest';

interface ExamFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

export function ExamFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
}: ExamFiltersProps) {
  const { t, i18n } = useTranslation('exams');
  const isRtl = i18n.language.startsWith('ar');

  const labels = {
    en: {
      searchPlaceholder: t('manageExams.searchPlaceholder'),
      statusAll: t('manageExams.statusFilter.All'),
      statusAlways: t('manageExams.statusFilter.Always Available'),
      statusActive: t('manageExams.statusFilter.Active'),
      statusUpcoming: t('manageExams.statusFilter.Upcoming'),
      statusDisabled: t('manageExams.statusFilter.Disabled'),
      statusExpired: t('manageExams.statusFilter.Expired'),
      sortNewest: t('manageExams.sortNewest'),
      sortOldest: t('manageExams.sortOldest'),
    },
    ar: {
      searchPlaceholder: 'ابحث بالاسم أو المادة...',
      statusAll: 'الكل',
      statusAlways: 'متاح دائماً',
      statusActive: 'نشط',
      statusUpcoming: 'قادم',
      statusDisabled: 'مسودة / معطل',
      statusExpired: 'منتهي',
      sortNewest: 'الأحدث',
      sortOldest: 'الأقدم',
    }
  };
  const txt = isRtl ? labels.ar : labels.en;

  return (
    <div className={styles.filtersBar} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={styles.searchBox}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder={txt.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filterSelectWrapper}>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className={styles.filterSelect}
        >
          <option value="All">{txt.statusAll}</option>
          <option value="Always Available">{txt.statusAlways}</option>
          <option value="Active">{txt.statusActive}</option>
          <option value="Upcoming">{txt.statusUpcoming}</option>
          <option value="Disabled">{txt.statusDisabled}</option>
          <option value="Expired">{txt.statusExpired}</option>
        </select>
        <div className={styles.filterIcon}>
          <Filter size={16} />
        </div>
      </div>

      <div className={styles.filterSelectWrapper}>
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className={styles.filterSelect}
        >
          <option value="newest">{txt.sortNewest}</option>
          <option value="oldest">{txt.sortOldest}</option>
        </select>
        <div className={styles.filterIcon}>
          <ArrowUpDown size={16} />
        </div>
      </div>
    </div>
  );
}
