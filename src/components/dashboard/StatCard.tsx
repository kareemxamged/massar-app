import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

export default function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="glass-card p-5 flex items-center gap-4" style={{ cursor: 'default' }}>
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl"
        style={{ background: bgColor }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="text-start">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
      </div>
    </div>
  );
}
