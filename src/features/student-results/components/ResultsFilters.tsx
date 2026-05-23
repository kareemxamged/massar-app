import { useTranslation } from 'react-i18next';
import { Search, Filter, Download as DownloadIcon } from 'lucide-react';
import styles from '../../../pages/student/StudentResults.module.css';

interface ResultsFiltersProps {
    search: string;
    setSearch: (v: string) => void;
    subjectFilter: string;
    setSubjectFilter: (v: string) => void;
    sortOrder: string;
    setSortOrder: (v: string) => void;
    subjects: string[];
    onExport: () => void;
    exportDisabled: boolean;
}

export default function ResultsFilters({ search, setSearch, subjectFilter, setSubjectFilter, sortOrder, setSortOrder, subjects, onExport, exportDisabled }: ResultsFiltersProps) {
    const { t, i18n } = useTranslation('common');

    return (
        <div className={`glass-card ${styles.filtersBar}`} style={{ direction: i18n.dir() }}>
            <div className={styles.searchWrapper}>
                <input
                    type="text"
                    placeholder={t('studentResults.filters.searchPlaceholder', 'Search exams...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <span className={styles.searchIcon}>
                    <Search size={20} />
                </span>
            </div>

            <div className={styles.filterWrapper}>
                <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="All">{t('studentResults.filters.allSubjects', 'All Subjects')}</option>
                    {subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>
                <span className={styles.filterIcon}>
                    <Filter size={20} />
                </span>
            </div>

            <div className={styles.filterWrapper}>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="Newest">{t('studentResults.filters.sort.newest', 'Sort: Newest First')}</option>
                    <option value="Oldest">{t('studentResults.filters.sort.oldest', 'Sort: Oldest First')}</option>
                    <option value="Highest">{t('studentResults.filters.sort.highest', 'Sort: Highest Score')}</option>
                    <option value="Lowest">{t('studentResults.filters.sort.lowest', 'Sort: Lowest Score')}</option>
                </select>
            </div>

            <button
                onClick={onExport}
                disabled={exportDisabled}
                className={styles.exportBtn}
            >
                <DownloadIcon size={20} /> <span>{t('studentResults.filters.exportCsv', 'Export CSV')}</span>
            </button>
        </div>
    );
}
