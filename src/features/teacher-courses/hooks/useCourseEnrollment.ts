import { useState, useCallback } from 'react';
import {
    enrollmentsApi,
    EnrolledStudent,
    StudentProfile,
} from '../api/enrollmentsApi';

interface UseCourseEnrollmentReturn {
    enrolledStudents: EnrolledStudent[];
    searchResults: StudentProfile[];
    isLoading: boolean;
    isSearching: boolean;
    fetchEnrolled: (courseId: number) => Promise<void>;
    searchStudents: (query: string, courseId: number) => Promise<void>;
    enrollStudent: (courseId: number, studentId: string) => Promise<void>;
    enrollGroup: (courseId: number, filters: { level?: string; major?: string }) => Promise<number>;
    removeEnrollment: (enrollmentId: string) => Promise<void>;
    clearSearch: () => void;
}

export function useCourseEnrollment(): UseCourseEnrollmentReturn {
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
    const [searchResults, setSearchResults] = useState<StudentProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const fetchEnrolled = useCallback(async (courseId: number) => {
        setIsLoading(true);
        try {
            const data = await enrollmentsApi.getEnrolledStudents(courseId);
            setEnrolledStudents(data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const searchStudents = useCallback(async (query: string, courseId: number) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const data = await enrollmentsApi.searchStudents(query, courseId);
            setSearchResults(data);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const enrollStudent = useCallback(
        async (courseId: number, studentId: string) => {
            await enrollmentsApi.enrollStudent(courseId, studentId);
            await fetchEnrolled(courseId);
            setSearchResults([]);
        },
        [fetchEnrolled]
    );

    const enrollGroup = useCallback(
        async (courseId: number, filters: { level?: string; major?: string }) => {
            const count = await enrollmentsApi.enrollGroup(courseId, filters);
            await fetchEnrolled(courseId);
            return count;
        },
        [fetchEnrolled]
    );

    const removeEnrollment = useCallback(
        async (enrollmentId: string) => {
            await enrollmentsApi.removeEnrollment(enrollmentId);
            setEnrolledStudents((prev) => prev.filter((e) => e.id !== enrollmentId));
        },
        []
    );

    const clearSearch = useCallback(() => setSearchResults([]), []);

    return {
        enrolledStudents,
        searchResults,
        isLoading,
        isSearching,
        fetchEnrolled,
        searchStudents,
        enrollStudent,
        enrollGroup,
        removeEnrollment,
        clearSearch,
    };
}
