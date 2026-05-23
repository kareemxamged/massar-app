import { useState, useCallback } from 'react';
import { statsApi, CourseStats, StudentPerformance } from '../api/statsApi';

export function useCourseStats(courseId: number) {
    const [stats, setStats] = useState<CourseStats | null>(null);
    const [performance, setPerformance] = useState<StudentPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statsData, perfData] = await Promise.all([
                statsApi.getCourseStats(courseId),
                statsApi.getStudentPerformance(courseId),
            ]);
            setStats(statsData);
            setPerformance(perfData);
        } catch (err: any) {
            console.error('Failed to load course stats:', err);
            setError(err.message || 'An error occurred while fetching course stats.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    return {
        stats,
        performance,
        isLoading,
        error,
        fetchStats,
    };
}
