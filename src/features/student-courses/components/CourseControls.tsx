import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';
import styles from '../../../pages/student/StudentCourses.module.css';

interface CourseControlsProps {
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    filterSemester: string;
    setFilterSemester: (v: string) => void;
    filterDept: string;
    setFilterDept: (v: string) => void;
}

export default function CourseControls({
    searchQuery,
    setSearchQuery,
    filterSemester,
    setFilterSemester,
    filterDept,
    setFilterDept
}: CourseControlsProps) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div className={styles.filtersBar} style={{ direction: i18n.dir() }}>
            <div className={styles.searchWrapper}>
                <div className={styles.searchIcon}>
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder={t('studentCourses.searchPlaceholder', 'Search for a course...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.filtersGroup}>
                <div className={styles.dropdownWrapper}>
                    <select
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                        className={styles.dropdownSelect}
                    >
                        <option value="all">{t('studentCourses.allSemesters', 'All Semesters')}</option>
                        <option value="Fall 2024">Fall 2024</option>
                        <option value="Spring 2024">Spring 2024</option>
                    </select>
                    <div className={styles.dropdownIcon} style={{ right: isRtl ? 'auto' : '12px', left: isRtl ? '12px' : 'auto' }}>
                        <Filter size={18} />
                    </div>
                </div>

                <div className={styles.dropdownWrapper}>
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className={styles.dropdownSelect}
                    >
                        <option value="all">{t('studentCourses.allDepartments', 'All Departments')}</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Systems">Information Systems</option>
                    </select>
                    <div className={styles.dropdownIcon} style={{ right: isRtl ? 'auto' : '12px', left: isRtl ? '12px' : 'auto' }}>
                        <Filter size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}
