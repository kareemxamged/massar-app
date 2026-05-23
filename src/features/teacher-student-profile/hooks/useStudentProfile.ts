import { useState, useEffect } from 'react';
import { studentProfileService, StudentProfile, StudentSubmission, StudentStats } from '../api/studentProfileService';

interface UseStudentProfileReturn {
    profile: StudentProfile | null;
    submissions: StudentSubmission[];
    stats: StudentStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useStudentProfile(studentId: string | undefined): UseStudentProfileReturn {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!studentId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [profileData, submissionsData] = await Promise.all([
                studentProfileService.getStudentProfile(studentId),
                studentProfileService.getStudentSubmissions(studentId)
            ]);

            setProfile(profileData);
            setSubmissions(submissionsData);
            setStats(studentProfileService.calculateStats(submissionsData));
        } catch (err: any) {
            console.error('Error fetching student profile data:', err);
            setError(err.message || 'Failed to load student profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    return {
        profile,
        submissions,
        stats,
        loading,
        error,
        refetch: fetchData
    };
}
