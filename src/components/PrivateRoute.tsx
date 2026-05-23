import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppRole } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface PrivateRouteProps {
    allowedRoles?: AppRole[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
