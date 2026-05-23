import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart2, BookMarked, Trophy, BookOpen } from 'lucide-react';
import { TabId } from '../types';

interface CourseTabsProps {
    activeTab: TabId;
    switchTab: (tab: TabId) => void;
    tabCounts: Record<TabId, number | null>;
}

export default function CourseTabs({ activeTab, switchTab, tabCounts }: CourseTabsProps) {
    const { t, i18n } = useTranslation('common');

    const TAB_CONFIG: { id: TabId; labelKey: string; fallback: string; icon: React.ReactNode }[] = [
        { id: 'overview', labelKey: 'overview', fallback: 'Overview', icon: <BarChart2 size={15} /> },
        { id: 'exams', labelKey: 'exams', fallback: 'Exams', icon: <BookMarked size={15} /> },
        { id: 'grades', labelKey: 'grades', fallback: 'Grades', icon: <Trophy size={15} /> },
        { id: 'materials', labelKey: 'materials', fallback: 'Materials', icon: <BookOpen size={15} /> },
    ];

    return (
        <div style={{
            display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0',
            direction: i18n.dir()
        }}>
            {TAB_CONFIG.map(tab => {
                const active = activeTab === tab.id;
                const count = tabCounts[tab.id];
                return (
                    <button key={tab.id}
                        className="cd-tab-btn"
                        onClick={() => switchTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.7rem 1.25rem', background: 'transparent', border: 'none',
                            color: active ? 'white' : 'var(--text-muted)',
                            fontWeight: active ? 700 : 400, fontSize: '0.9rem',
                            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                            cursor: 'pointer', textTransform: 'capitalize',
                            position: 'relative', bottom: '-1px'
                        }}>
                        <span style={{ color: active ? 'var(--primary)' : 'inherit' }}>{tab.icon}</span>
                        {t(`courseDetails.tabs.${tab.labelKey}`, tab.fallback)}
                        {count !== null && (
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px',
                                borderRadius: '99px', lineHeight: 1.6,
                                background: active ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                color: active ? 'white' : 'var(--text-muted)'
                            }}>{count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
