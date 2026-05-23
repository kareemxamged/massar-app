import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './StudentResults.module.css';

// Feature Components
import ResultsHeader from '../../features/student-results/components/ResultsHeader';
import ResultsFilters from '../../features/student-results/components/ResultsFilters';
import ResultsChart from '../../features/student-results/components/ResultsChart';
import ResultsList from '../../features/student-results/components/ResultsList';

export default function StudentResults() {
    const { t, i18n } = useTranslation('common');
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);

    // Filters & Sorting
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Newest');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await examService.getUserResults();
                setResults(data);
                setFilteredResults(data);
            } catch (error) {
                console.error("Failed to load results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    useEffect(() => {
        let res = [...results];

        // 1. Search Filter
        if (search) {
            res = res.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
        }

        // 2. Subject Filter
        if (subjectFilter !== 'All') {
            res = res.filter(r => r.subject === subjectFilter);
        }

        // 3. Sorting
        res.sort((a, b) => {
            if (sortOrder === 'Newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortOrder === 'Oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortOrder === 'Highest') return b.percentage - a.percentage;
            if (sortOrder === 'Lowest') return a.percentage - b.percentage;
            return 0;
        });

        setFilteredResults(res);
    }, [search, subjectFilter, sortOrder, results]);

    // Safe Stats Calculation (O(N) safe from stack overflow)
    const totalExams = filteredResults.length;
    const avgScore = totalExams > 0
        ? Math.round(filteredResults.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams)
        : 0;

    const highestScore = totalExams > 0
        ? filteredResults.reduce((max, r) => (r.percentage > max ? r.percentage : max), 0)
        : 0;

    const lowestScore = totalExams > 0
        ? filteredResults.reduce((min, r) => (r.percentage < min ? r.percentage : min), 100)
        : 0;

    const handleDownload = () => {
        if (filteredResults.length === 0) return;

        // Note: Headers are technically better localized for the downloaded CSV file if needed 
        // but for technical systems usually left in EN. Let's keep them static for now.
        const headers = ['Exam Title', 'Subject', 'Date', 'Score (%)', 'Status'];
        const csvRows = [
            headers.join(','),
            ...filteredResults.map(r => [
                `"${r.title}"`,
                `"${r.subject || 'General'}"`,
                new Date(r.date).toLocaleDateString(i18n.dir() === 'rtl' ? 'ar-SA' : 'en-US'),
                r.percentage,
                r.status
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-results-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <LoadingSpinner fullScreen text={t('examResult.loading', 'Loading results...')} />;

    const allSubjects = Array.from(new Set(results.map(r => r.subject).filter(Boolean))).map(String);

    return (
        <div className={styles.container}>
            <ResultsHeader
                totalExams={totalExams}
                avgScore={avgScore}
                highestScore={highestScore}
                lowestScore={lowestScore}
            />

            <ResultsFilters
                search={search}
                setSearch={setSearch}
                subjectFilter={subjectFilter}
                setSubjectFilter={setSubjectFilter}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                onExport={handleDownload}
                exportDisabled={filteredResults.length === 0}
                subjects={allSubjects}
            />

            <ResultsChart results={results} />

            <ResultsList filteredResults={filteredResults} />
        </div>
    );
}
