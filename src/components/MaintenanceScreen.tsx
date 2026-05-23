import { ShieldOff } from 'lucide-react';

interface Props {
  message?: string | null;
  siteName?: string;
}

export default function MaintenanceScreen({ message, siteName = 'Exam Management System' }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg-main, #0f1117)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-10 flex flex-col items-center text-center space-y-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(251,113,133,0.12)' }}>
          <ShieldOff size={44} style={{ color: '#fb7185' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main, #f1f5f9)' }}>
            Under Maintenance
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            {message?.trim()
              ? message
              : `${siteName} is currently undergoing scheduled maintenance. We'll be back shortly.`}
          </p>
        </div>
        <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
          Please check back later or contact support if this persists.
        </p>
      </div>
    </div>
  );
}
