import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExamScoreData {
  name: string;
  avgScore: number;
  submissions: number;
}

interface PerformanceChartProps {
  data: ExamScoreData[];
}

import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  const { t } = useTranslation('common');
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-2 text-xs" style={{ background: 'var(--bg-panel)' }}>
        <p style={{ color: 'var(--text-main)' }}>{label}</p>
        <p style={{ color: 'var(--accent)' }}>{t('teacherDashboard.avgScore', 'Avg Score')}: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#2dd4bf', '#38bdf8', '#fb923c', '#f97316'];

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const { t, i18n } = useTranslation('common');

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2" dir={i18n.dir()}>
        <p style={{ color: 'var(--text-muted)' }}>{t('teacherDashboard.noData', 'No exam data yet')}</p>
        <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
          {t('teacherDashboard.noDataSub', 'Create exams and receive submissions to see performance insights')}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avgScore" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((_, index) => (
            <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
