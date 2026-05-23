import { X, GitCompare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Portal from '../../../components/Portal';
import type { AuditAction } from '../types';

interface Props {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  actionType: AuditAction;
  entityInfo: string;
  onClose: () => void;
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}

export default function DiffViewer({ oldData, newData, actionType, entityInfo, onClose }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const isInsert = !oldData && newData !== null;
  const isDelete = oldData !== null && !newData;
  const isUpdate = oldData !== null && newData !== null;

  const allKeys = isUpdate
    ? Array.from(new Set([...Object.keys(oldData!), ...Object.keys(newData!)]))
    : [];
  const changedKeys = isUpdate ? allKeys.filter(k => JSON.stringify(oldData![k]) !== JSON.stringify(newData![k])) : [];
  const unchangedKeys = isUpdate ? allKeys.filter(k => JSON.stringify(oldData![k]) === JSON.stringify(newData![k])) : [];

  const insertKeys = isInsert ? Object.keys(newData!) : [];
  const deleteKeys = isDelete ? Object.keys(oldData!) : [];

  const changedCount = isUpdate ? changedKeys.length : (insertKeys.length || deleteKeys.length);

  const title = `${actionType} · ${entityInfo}`;

  return (
    <Portal>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', zIndex: 400 }}
        onClick={onClose}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div
          className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col"
          style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(99,102,241,0.07)' }}
          >
            <div className="flex items-center gap-2.5">
              <GitCompare size={16} style={{ color: '#6366f1' }} className="shrink-0" />
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                <span dir="ltr" className="inline-block text-start">{title}</span>
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-3 sm:gap-5 self-end sm:self-auto">
              {isInsert && (
                <span className="text-xs font-mono shrink-0" style={{ color: '#34d399' }}>
                  {isRtl ? `${insertKeys.length} حقل مضاف` : `${insertKeys.length} fields inserted`}
                </span>
              )}
              {isDelete && (
                <span className="text-xs font-mono shrink-0" style={{ color: '#fb7185' }}>
                  {isRtl ? `${deleteKeys.length} حقل محذوف` : `${deleteKeys.length} fields deleted`}
                </span>
              )}
              {isUpdate && (
                <span className="text-xs font-mono shrink-0" style={{ color: '#fbbf24' }}>
                  {isRtl ? `${changedKeys.length} حقل مُعدل` : `${changedKeys.length} fields changed`}
                </span>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* File legend bar */}
          <div
            className="flex items-center gap-6 px-5 py-2 text-xs"
            style={{ fontFamily: 'ui-monospace,SFMono-Regular,monospace', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            dir="ltr"
          >
            {(isDelete || isUpdate) && <span style={{ color: '#fb7185' }}>--- a/old_data</span>}
            {(isInsert || isUpdate) && <span style={{ color: '#34d399' }}>+++ b/new_data</span>}
            <span style={{ color: '#fbbf24' }}>{isRtl ? `${changedCount} تغييرات` : `${changedCount} changes`}</span>
          </div>

          {/* Diff body */}
          <div
            className="overflow-y-auto flex-1 p-4 space-y-1 text-left"
            dir="ltr"
            style={{ fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontSize: 12, lineHeight: 1.6 }}
          >
            {/* INSERT: all keys green */}
            {isInsert && insertKeys.map(key => (
              <div key={key} className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <span style={{ color: '#34d399', flexShrink: 0, userSelect: 'none' }}>+</span>
                <span style={{ color: '#34d399', flexShrink: 0 }}>{key}:</span>
                <span style={{ color: '#6ee7b7', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(newData![key])}</span>
              </div>
            ))}

            {/* DELETE: all keys red */}
            {isDelete && deleteKeys.map(key => (
              <div key={key} className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.15)' }}>
                <span style={{ color: '#fb7185', flexShrink: 0, userSelect: 'none' }}>−</span>
                <span style={{ color: '#fb7185', flexShrink: 0 }}>{key}:</span>
                <span style={{ color: '#fca5a5', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(oldData![key])}</span>
              </div>
            ))}

            {/* UPDATE: changed fields first */}
            {isUpdate && changedKeys.length === 0 && (
              <p className="text-xs px-2" style={{ color: 'var(--text-muted)' }} dir={isRtl ? 'rtl' : 'ltr'}>
                {isRtl ? 'لا توجد تغييرات' : 'No changes detected.'}
              </p>
            )}
            {isUpdate && changedKeys.map(key => {
              const inOld = key in oldData!;
              const inNew = key in newData!;
              return (
                <div key={key} className="space-y-0.5">
                  {inOld && (
                    <div className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.15)' }}>
                      <span style={{ color: '#fb7185', flexShrink: 0, userSelect: 'none' }}>−</span>
                      <span style={{ color: '#fb7185', flexShrink: 0 }}>{key}:</span>
                      <span style={{ color: '#fca5a5', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(oldData![key])}</span>
                    </div>
                  )}
                  {inNew && (
                    <div className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                      <span style={{ color: '#34d399', flexShrink: 0, userSelect: 'none' }}>+</span>
                      <span style={{ color: '#34d399', flexShrink: 0 }}>{key}:</span>
                      <span style={{ color: '#6ee7b7', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(newData![key])}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unchanged fields (context lines) */}
            {isUpdate && unchangedKeys.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs mb-2 px-1" style={{ color: 'var(--text-muted)' }} dir={isRtl ? 'rtl' : 'ltr'}>
                  {isRtl ? `${unchangedKeys.length} حقول لم تتغير:` : `${unchangedKeys.length} unchanged fields:`}
                </p>
                {unchangedKeys.map(key => (
                  <div key={key} className="flex gap-2 px-3 py-0.5">
                    <span style={{ color: 'rgba(148,163,184,0.3)', flexShrink: 0, userSelect: 'none' }}> </span>
                    <span style={{ color: 'rgba(148,163,184,0.4)', flexShrink: 0 }}>{key}:</span>
                    <span style={{ color: 'rgba(148,163,184,0.4)', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(oldData![key])}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
