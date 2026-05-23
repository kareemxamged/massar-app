import { useTranslation } from 'react-i18next';
import { gradeColor, gradeLetter, STATUS_META } from '../utils';

export function RadialProgress({ value, size = 120, stroke = 10 }: { value: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(value, 100) / 100);
    const color = gradeColor(value);
    const { i18n } = useTranslation('common');

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, direction: 'ltr' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color, fontWeight: 700, direction: i18n.dir()
            }}>
                <span style={{ fontSize: '1.4rem' }}>{value}%</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>{gradeLetter(value)}</span>
            </div>
        </div>
    );
}

export function StatusTag({ status }: { status: string }) {
    const { t, i18n } = useTranslation('common');
    const meta = STATUS_META[status] ?? STATUS_META.upcoming;
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
            color: meta.color, background: meta.bg, border: `1px solid ${meta.color}33`,
            letterSpacing: '0.03em', whiteSpace: 'nowrap', direction: i18n.dir()
        }}>
            {status === 'active' ? '● ' : ''}{t(`courseDetails.status.${meta.labelKey}`, meta.labelKey)}
        </span>
    );
}

export function MiniBar({ pct }: { pct: number }) {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';
    return (
        <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginTop: '6px', transform: isRtl ? 'scaleX(-1)' : 'none' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '99px', background: gradeColor(pct), transition: 'width 0.8s ease' }} />
        </div>
    );
}
