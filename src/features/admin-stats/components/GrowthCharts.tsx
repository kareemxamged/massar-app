import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { RegistrationPoint, CourseDistPoint } from '../types';

const PIE_COLORS = ['#818cf8', '#2dd4bf', '#fbbf24', '#fb7185', '#a78bfa', '#34d399'];

const tooltipStyle = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#f8fafc',
  fontSize: '0.8rem',
};

function renderPieLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, value, name } = props;
  if (
    cx === undefined || cy === undefined || midAngle === undefined ||
    innerRadius === undefined || outerRadius === undefined
  ) return null;
  const RADIAN = Math.PI / 180;
  const radius = (Number(innerRadius)) + (Number(outerRadius) - Number(innerRadius)) * 1.35;
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);
  const label = String(name ?? '');
  const displayVal = Number(value ?? 0);

  // RTL aware text anchor might need explicit left/right rather than start/end
  // Recharts textAnchor behavior can sometimes be tricky with true RTL
  const isRightSide = x > Number(cx);
  return (
    <text x={x} y={y} fill="#94a3b8" fontSize={11} textAnchor={isRightSide ? 'start' : 'end'} dominantBaseline="central">
      {label.length > 14 ? `${label.slice(0, 13)}…` : label} ({displayVal})
    </text>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: '1.2rem' }}>📊</span>
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="w-full h-full rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 h-full"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{title}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

interface Props {
  trend: RegistrationPoint[];
  distribution: CourseDistPoint[];
  loading: boolean;
}

export default function GrowthCharts({ trend, distribution, loading }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const hasTrend = trend.some(p => p.users > 0);
  const hasDist = distribution.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '320px' }}>

      <div className="lg:col-span-3">
        <ChartCard
          title={isRtl ? 'اتجاه تسجيل المستخدمين' : 'User Registration Trend'}
          subtitle={isRtl ? 'التسجيلات الجديدة خلال آخر 30 يومًا' : 'New signups over the last 30 days'}
        >
          {loading ? (
            <ChartSkeleton />
          ) : !hasTrend ? (
            <EmptyState message={isRtl ? 'لا توجد تسجيلات في آخر 30 يومًا' : 'No registrations in the last 30 days'} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                  reversed={isRtl}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  orientation={isRtl ? 'right' : 'left'}
                />
                <Tooltip
                  contentStyle={{ ...tooltipStyle, textAlign: isRtl ? 'right' : 'left' }}
                  cursor={{ stroke: 'rgba(129,140,248,0.3)', strokeWidth: 1 }}
                  formatter={(v) => [v, isRtl ? 'مستخدمون جدد' : 'New Users']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#gradUsers)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#818cf8', stroke: '#1e293b', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="lg:col-span-2">
        <ChartCard
          title={isRtl ? 'المقررات حسب القسم' : 'Courses by Department'}
          subtitle={isRtl ? 'توزيع المقررات المعتمدة' : 'Approved courses breakdown'}
        >
          {loading ? (
            <ChartSkeleton />
          ) : !hasDist ? (
            <EmptyState message={isRtl ? 'لا توجد مقررات معتمدة للعرض' : 'No approved courses to display'} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  dataKey="value"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ ...tooltipStyle, textAlign: isRtl ? 'right' : 'left' }}
                  formatter={(v, name) => [v, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '8px' }}
                  formatter={(value: string) => value.length > 18 ? `${value.slice(0, 17)}…` : value}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

    </div>
  );
}
