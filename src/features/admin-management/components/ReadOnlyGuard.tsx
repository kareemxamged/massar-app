import { useAuth } from '../../../hooks/useAuth';

interface ReadOnlyGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ReadOnlyGuard({ children, fallback }: ReadOnlyGuardProps) {
  const { user } = useAuth();
  
  // If user is admin, allow editing
  if (user?.role === 'admin') {
    return <>{children}</>;
  }
  
  // If not admin, show read-only fallback or nothing
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default: show children as disabled
  return (
    <div className="relative">
      <div className="opacity-60 pointer-events-none select-none">
        {children}
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center rounded-lg"
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      >
        <span className="text-sm px-3 py-1 rounded glass-card" style={{ color: 'var(--text-muted)' }}>
          Contact admin to modify
        </span>
      </div>
    </div>
  );
}
