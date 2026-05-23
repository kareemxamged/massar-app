import React from 'react';
import { useTranslation } from 'react-i18next';
import { Material } from '../types';
import { BookOpen, CheckCircle2, Circle, FileText, Play, ExternalLink } from 'lucide-react';

interface MaterialsTabProps {
    groupedMaterials: Record<number, Material[]>;
    materialsLength: number;
    viewed: Set<number>;
    toggleViewed: (matId: number) => void;
    panelStyle: React.CSSProperties;
    tabKey: number;
}

export default function MaterialsTab({ groupedMaterials, materialsLength, viewed, toggleViewed, panelStyle, tabKey }: MaterialsTabProps) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    const TYPE_META: Record<string, { color: string; icon: React.ReactNode; actionKey: string }> = {
        pdf: { color: '#ef4444', icon: <FileText size={18} />, actionKey: 'download' },
        video: { color: '#8b5cf6', icon: <Play size={18} />, actionKey: 'watch' },
        slides: { color: '#3b82f6', icon: <BookOpen size={18} />, actionKey: 'download' },
        link: { color: '#10b981', icon: <ExternalLink size={18} />, actionKey: 'open' },
        code: { color: '#f59e0b', icon: <FileText size={18} />, actionKey: 'download' },
    };

    return (
        <div key={`mat-${tabKey}`} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '2rem', direction: i18n.dir() }}>
            {materialsLength === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <BookOpen size={32} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem' }}>{t('courseDetails.materials.noMaterialsTitle', 'No materials yet.')}</h3>
                    <p style={{ margin: 0 }}>{t('courseDetails.materials.noMaterialsDesc', 'Materials will appear here once uploaded by the instructor.')}</p>
                </div>
            ) : Object.entries(groupedMaterials).sort(([a], [b]) => Number(a) - Number(b)).map(([week, mats]) => (
                <div key={week}>
                    <div style={{
                        fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        marginBottom: '0.75rem', paddingBottom: '0.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <span>{Number(week) > 0 ? `${t('courseDetails.materials.week', 'Week')} ${week}` : t('courseDetails.materials.general', 'General')}</span>
                        <span style={{ fontWeight: 400 }}>{(mats as Material[]).filter(m => viewed.has(m.id)).length} / {(mats as Material[]).length} {t('courseDetails.materials.viewed', 'viewed')}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {(mats as Material[]).map(mat => {
                            const meta = TYPE_META[mat.type] ?? TYPE_META.link;
                            const isViewed = viewed.has(mat.id);
                            return (
                                <div key={mat.id} className="glass-card" style={{
                                    padding: '0.9rem 1.1rem',
                                    display: 'flex', alignItems: 'center', gap: '0.9rem',
                                    opacity: isViewed ? 0.65 : 1,
                                    transition: 'opacity 0.25s',
                                    border: isViewed ? '1px solid rgba(52,211,153,0.15)' : undefined
                                }}>
                                    {/* Type icon */}
                                    <div style={{
                                        width: '40px', height: '40px', flexShrink: 0, borderRadius: '9px',
                                        background: `${meta.color}18`, border: `1px solid ${meta.color}33`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: meta.color, position: 'relative'
                                    }}>
                                        {meta.icon}
                                        {isViewed && (
                                            <div style={{
                                                position: 'absolute', bottom: '-4px', right: isRtl ? 'auto' : '-4px', left: isRtl ? '-4px' : 'auto',
                                                background: '#10b981', borderRadius: '50%', width: '14px', height: '14px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <CheckCircle2 size={10} color="white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1px' }}>
                                            <span style={{ fontWeight: 600, color: 'white', fontSize: '0.92rem' }}>{mat.title}</span>
                                            {/* Inline action link */}
                                            <a href={mat.url || '#'} target="_blank" rel="noopener noreferrer"
                                                style={{
                                                    fontSize: '0.75rem', color: meta.color, fontWeight: 600,
                                                    textDecoration: 'none', padding: '1px 8px',
                                                    background: `${meta.color}15`, borderRadius: '6px',
                                                    border: `1px solid ${meta.color}30`, whiteSpace: 'nowrap'
                                                }}>
                                                {t(`courseDetails.materials.action.${meta.actionKey}`, meta.actionKey)}
                                            </a>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{mat.description}</div>
                                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.73rem' }}>
                                            <span style={{ color: meta.color, fontWeight: 600 }}>{t(`courseDetails.materials.type.${mat.type}`, mat.type)}</span>
                                            {mat.file_size && <span style={{ color: 'var(--text-muted)' }}>{mat.file_size}</span>}
                                            {mat.duration && <span style={{ color: 'var(--text-muted)' }}>⏱ {mat.duration}</span>}
                                        </div>
                                    </div>

                                    {/* Viewed Toggle */}
                                    <button className="cd-viewed-btn"
                                        onClick={() => toggleViewed(mat.id)}
                                        title={isViewed ? t('courseDetails.materials.markUnviewed', 'Mark as unviewed') : t('courseDetails.materials.markViewed', 'Mark as viewed')}
                                        style={{
                                            flexShrink: 0, background: 'transparent', border: 'none',
                                            cursor: 'pointer', color: isViewed ? '#10b981' : 'rgba(255,255,255,0.2)',
                                            padding: '4px', borderRadius: '6px'
                                        }}>
                                        {isViewed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
