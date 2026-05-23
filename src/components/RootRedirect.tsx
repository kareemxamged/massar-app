import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function RootRedirect() {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner fullScreen />;

    if (!user) return <Navigate to="/login" replace />;

    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
}
