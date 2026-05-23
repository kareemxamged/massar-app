import { useState, useEffect, useCallback } from 'react';
import { Course, CourseFormData } from '../types';
import { coursesApi } from '../api/coursesApi';

export function useCourses(teacherId: string | undefined) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchCourses = useCallback(async () => {
        if (!teacherId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await coursesApi.getCourses(teacherId);
            setCourses(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch courses'));
        } finally {
            setIsLoading(false);
        }
    }, [teacherId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const createCourse = async (data: CourseFormData) => {
        if (!teacherId) throw new Error('Teacher ID is required');
        const newCourse = await coursesApi.createCourse(teacherId, data);
        setCourses(prev => [newCourse, ...prev]);
        return newCourse;
    };

    const updateCourse = async (id: number, data: Partial<CourseFormData>) => {
        const updatedCourse = await coursesApi.updateCourse(id, data);
        setCourses(prev => prev.map(c => (c.id === id ? updatedCourse : c)));
        return updatedCourse;
    };

    const deleteCourse = async (id: number) => {
        await coursesApi.deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
    };

    return {
        courses,
        isLoading,
        error,
        refetch: fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse
    };
}
