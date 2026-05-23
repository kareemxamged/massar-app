import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Check, Tag, Layers } from 'lucide-react';
import type { Specialty, SpecialtyInput } from '../types';

interface AcademicLevel {
  id: number;
  name: string;
  code: string | null;
  display_order: number | null;
}

interface Props {
  specialties: Specialty[];
  specialtiesLoading: boolean;
  onCreateSpecialty: (input: SpecialtyInput) => Promise<void>;
  onUpdateSpecialty: (id: number, input: SpecialtyInput) => Promise<void>;
  onDeleteSpecialty: (id: number) => Promise<void>;

  academicLevels: AcademicLevel[];
  levelsLoading: boolean;
  onCreateLevel: (input: { name: string; code: string; display_order: number }) => Promise<void>;
  onUpdateLevel: (id: number, input: { name: string; code: string; display_order: number }) => Promise<void>;
  onDeleteLevel: (id: number) => Promise<void>;
}

type ConfirmDelete = { type: 'specialty' | 'level'; id: number; name: string } | null;

function emptySpecialtyForm(): SpecialtyInput {
  return { name: '', code: '', description: '' };
}

function InlineForm({
  label,
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: error ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'var(--text-main)',
            padding: '6px 10px',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button onClick={onSave} disabled={saving} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50" style={{ color: '#34d399' }}>
          <Check size={15} />
        </button>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <X size={15} />
        </button>
      </div>
      {error && <span className="text-xs" style={{ color: '#fb7185' }}>{error}</span>}
    </div>
  );
}

export default function CategoryTaxonomyManager({
  specialties, specialtiesLoading, onCreateSpecialty, onUpdateSpecialty, onDeleteSpecialty,
  academicLevels, levelsLoading, onCreateLevel, onUpdateLevel, onDeleteLevel,
}: Props) {
  const { t } = useTranslation('content');

  // Specialty state
  const [newSpecialty, setNewSpecialty] = useState<SpecialtyInput | null>(null);
  const [editSpecialty, setEditSpecialty] = useState<{ id: number; form: SpecialtyInput } | null>(null);
  const [savingSpec, setSavingSpec] = useState(false);
  const [specError, setSpecError] = useState('');

  // Level state
  const [newLevel, setNewLevel] = useState<{ name: string; code: string; display_order: string } | null>(null);
  const [editLevel, setEditLevel] = useState<{ id: number; form: { name: string; code: string; display_order: string } } | null>(null);
  const [savingLevel, setSavingLevel] = useState(false);
  const [levelError, setLevelError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSaveNewSpecialty = async () => {
    if (!newSpecialty) return;
    if (!newSpecialty.name.trim()) { setSpecError(t('taxonomy.fields.nameRequired')); return; }
    setSavingSpec(true);
    setSpecError('');
    try {
      await onCreateSpecialty(newSpecialty);
      setNewSpecialty(null);
    } catch {
      setSpecError(t('taxonomy.specialties.saveFailed'));
    } finally {
      setSavingSpec(false);
    }
  };

  const handleSaveEditSpecialty = async () => {
    if (!editSpecialty) return;
    if (!editSpecialty.form.name.trim()) { setSpecError(t('taxonomy.fields.nameRequired')); return; }
    setSavingSpec(true);
    setSpecError('');
    try {
      await onUpdateSpecialty(editSpecialty.id, editSpecialty.form);
      setEditSpecialty(null);
    } catch {
      setSpecError(t('taxonomy.specialties.updateFailed'));
    } finally {
      setSavingSpec(false);
    }
  };

  const handleSaveNewLevel = async () => {
    if (!newLevel) return;
    if (!newLevel.name.trim()) { setLevelError(t('taxonomy.fields.nameRequired')); return; }
    setSavingLevel(true);
    setLevelError('');
    try {
      await onCreateLevel({ name: newLevel.name, code: newLevel.code, display_order: Number(newLevel.display_order) || 0 });
      setNewLevel(null);
    } catch {
      setLevelError(t('taxonomy.levels.saveFailed'));
    } finally {
      setSavingLevel(false);
    }
  };

  const handleSaveEditLevel = async () => {
    if (!editLevel) return;
    if (!editLevel.form.name.trim()) { setLevelError(t('taxonomy.fields.nameRequired')); return; }
    setSavingLevel(true);
    setLevelError('');
    try {
      await onUpdateLevel(editLevel.id, { name: editLevel.form.name, code: editLevel.form.code, display_order: Number(editLevel.form.display_order) || 0 });
      setEditLevel(null);
    } catch {
      setLevelError(t('taxonomy.levels.updateFailed'));
    } finally {
      setSavingLevel(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (confirmDelete.type === 'specialty') await onDeleteSpecialty(confirmDelete.id);
      else await onDeleteLevel(confirmDelete.id);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Specialties Panel */}
      <Section
        title={t('taxonomy.specialties.title')}
        subtitle={t('taxonomy.specialties.subtitle')}
        icon={<Tag size={18} style={{ color: '#f59e0b' }} />}
        iconBg="rgba(245,158,11,0.15)"
        addLabel={t('actions.add')}
        onAdd={() => { setNewSpecialty(emptySpecialtyForm()); setEditSpecialty(null); setSpecError(''); }}
        addDisabled={!!newSpecialty}
      >
        {specialtiesLoading ? <LoadingSkeleton /> : (
          <div className="space-y-2">
            {newSpecialty && (
              <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <InlineForm
                  label={t('taxonomy.fields.nameLabel')}
                  value={newSpecialty.name}
                  onChange={v => setNewSpecialty(f => f ? { ...f, name: v } : f)}
                  onSave={handleSaveNewSpecialty}
                  onCancel={() => { setNewSpecialty(null); setSpecError(''); }}
                  saving={savingSpec}
                  placeholder={t('taxonomy.fields.specialtyNamePh')}
                  error={specError}
                />
                <InlineForm
                  label={t('taxonomy.fields.codeLabel')}
                  value={newSpecialty.code}
                  onChange={v => setNewSpecialty(f => f ? { ...f, code: v } : f)}
                  onSave={handleSaveNewSpecialty}
                  onCancel={() => { setNewSpecialty(null); setSpecError(''); }}
                  saving={savingSpec}
                  placeholder={t('taxonomy.fields.specialtyCodePh')}
                />
              </div>
            )}

            {specialties.length === 0 && !newSpecialty && (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>{t('taxonomy.specialties.empty')}</p>
            )}

            {specialties.map(s => (
              <div key={s.id}>
                {editSpecialty?.id === s.id ? (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <InlineForm
                      label={t('taxonomy.fields.nameLabel')}
                      value={editSpecialty.form.name}
                      onChange={v => setEditSpecialty(e => e ? { ...e, form: { ...e.form, name: v } } : e)}
                      onSave={handleSaveEditSpecialty}
                      onCancel={() => { setEditSpecialty(null); setSpecError(''); }}
                      saving={savingSpec}
                      error={specError}
                    />
                    <InlineForm
                      label={t('taxonomy.fields.codeLabel')}
                      value={editSpecialty.form.code}
                      onChange={v => setEditSpecialty(e => e ? { ...e, form: { ...e.form, code: v } } : e)}
                      onSave={handleSaveEditSpecialty}
                      onCancel={() => { setEditSpecialty(null); setSpecError(''); }}
                      saving={savingSpec}
                    />
                  </div>
                ) : (
                  <CategoryRow
                    primary={s.name}
                    secondary={s.code ?? undefined}
                    editTitle={t('actions.edit')}
                    deleteTitle={t('actions.delete')}
                    onEdit={() => { setEditSpecialty({ id: s.id, form: { name: s.name, code: s.code ?? '', description: s.description ?? '' } }); setSpecError(''); }}
                    onDelete={() => setConfirmDelete({ type: 'specialty', id: s.id, name: s.name })}
                    color="#f59e0b"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Academic Levels Panel */}
      <Section
        title={t('taxonomy.levels.title')}
        subtitle={t('taxonomy.levels.subtitle')}
        icon={<Layers size={18} style={{ color: '#38bdf8' }} />}
        iconBg="rgba(56,189,248,0.15)"
        addLabel={t('actions.add')}
        onAdd={() => { setNewLevel({ name: '', code: '', display_order: String(academicLevels.length + 1) }); setEditLevel(null); setLevelError(''); }}
        addDisabled={!!newLevel}
      >
        {levelsLoading ? <LoadingSkeleton /> : (
          <div className="space-y-2">
            {newLevel && (
              <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <InlineForm
                  label={t('taxonomy.fields.nameLabel')}
                  value={newLevel.name}
                  onChange={v => setNewLevel(f => f ? { ...f, name: v } : f)}
                  onSave={handleSaveNewLevel}
                  onCancel={() => { setNewLevel(null); setLevelError(''); }}
                  saving={savingLevel}
                  placeholder={t('taxonomy.fields.levelNamePh')}
                  error={levelError}
                />
                <InlineForm
                  label={t('taxonomy.fields.codeLabel')}
                  value={newLevel.code}
                  onChange={v => setNewLevel(f => f ? { ...f, code: v } : f)}
                  onSave={handleSaveNewLevel}
                  onCancel={() => { setNewLevel(null); setLevelError(''); }}
                  saving={savingLevel}
                  placeholder={t('taxonomy.fields.levelCodePh')}
                />
                <InlineForm
                  label={t('taxonomy.fields.orderLabel')}
                  value={newLevel.display_order}
                  onChange={v => setNewLevel(f => f ? { ...f, display_order: v } : f)}
                  onSave={handleSaveNewLevel}
                  onCancel={() => { setNewLevel(null); setLevelError(''); }}
                  saving={savingLevel}
                  placeholder={t('taxonomy.fields.levelOrderPh')}
                />
              </div>
            )}

            {academicLevels.length === 0 && !newLevel && (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>{t('taxonomy.levels.empty')}</p>
            )}

            {academicLevels.map(l => (
              <div key={l.id}>
                {editLevel?.id === l.id ? (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <InlineForm
                      label={t('taxonomy.fields.nameLabel')}
                      value={editLevel.form.name}
                      onChange={v => setEditLevel(e => e ? { ...e, form: { ...e.form, name: v } } : e)}
                      onSave={handleSaveEditLevel}
                      onCancel={() => { setEditLevel(null); setLevelError(''); }}
                      saving={savingLevel}
                      error={levelError}
                    />
                    <InlineForm
                      label={t('taxonomy.fields.codeLabel')}
                      value={editLevel.form.code}
                      onChange={v => setEditLevel(e => e ? { ...e, form: { ...e.form, code: v } } : e)}
                      onSave={handleSaveEditLevel}
                      onCancel={() => { setEditLevel(null); setLevelError(''); }}
                      saving={savingLevel}
                    />
                    <InlineForm
                      label={t('taxonomy.fields.orderLabel')}
                      value={editLevel.form.display_order}
                      onChange={v => setEditLevel(e => e ? { ...e, form: { ...e.form, display_order: v } } : e)}
                      onSave={handleSaveEditLevel}
                      onCancel={() => { setEditLevel(null); setLevelError(''); }}
                      saving={savingLevel}
                    />
                  </div>
                ) : (
                  <CategoryRow
                    primary={l.name}
                    secondary={l.code ?? undefined}
                    badge={l.display_order != null ? t('taxonomy.levels.orderBadge', { n: l.display_order }) : undefined}
                    editTitle={t('actions.edit')}
                    deleteTitle={t('actions.delete')}
                    onEdit={() => { setEditLevel({ id: l.id, form: { name: l.name, code: l.code ?? '', display_order: String(l.display_order ?? '') } }); setLevelError(''); }}
                    onDelete={() => setConfirmDelete({ type: 'level', id: l.id, name: l.name })}
                    color="#38bdf8"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="glass-card w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>
              {t('taxonomy.delete.title', { name: confirmDelete.name })}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {confirmDelete.type === 'specialty'
                ? t('taxonomy.delete.messageSpecialty')
                : t('taxonomy.delete.messageLevel')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}
              >
                <Trash2 size={14} />
                {deleting ? t('actions.deleting') : t('actions.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, icon, iconBg, addLabel, onAdd, addDisabled, children }: {
  title: string; subtitle: string; icon: React.ReactNode; iconBg: string;
  addLabel: string; onAdd: () => void; addDisabled: boolean; children: React.ReactNode;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: iconBg }}>{icon}</div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{title}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onAdd}
          disabled={addDisabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-40"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <Plus size={13} /> {addLabel}
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CategoryRow({ primary, secondary, badge, editTitle, deleteTitle, onEdit, onDelete, color }: {
  primary: string; secondary?: string; badge?: string;
  editTitle: string; deleteTitle: string;
  onEdit: () => void; onDelete: () => void; color: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>{primary}</span>
        {secondary && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)' }}>{secondary}</span>}
        {badge && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{badge}</span>}
      </div>
      <div className="flex items-center gap-1 ms-2 flex-shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#6366f1' }} title={editTitle}>
          <Edit2 size={13} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#fb7185' }} title={deleteTitle}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}
