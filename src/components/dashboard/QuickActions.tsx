import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, BookOpen, ClipboardList } from 'lucide-react';

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  gradient: string;
}

function QuickAction({ icon, label, description, onClick, gradient }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-4 flex items-center justify-start gap-3 w-full"
      style={{ border: '1px solid rgba(255,255,255,0.08)', textAlign: 'start' }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{label}</p>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
    </button>
  );
}

import { useTranslation } from 'react-i18next';

export default function QuickActions() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const actions: QuickActionProps[] = [
    {
      icon: <Sparkles size={20} color="white" />,
      label: t('teacherDashboard.aiGenerator', 'AI Quiz Generator'),
      description: t('teacherDashboard.aiGeneratorDesc', 'Generate questions from documents'),
      onClick: () => navigate('/teacher/create-exam'),
      gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    },
    {
      icon: <Plus size={20} color="white" />,
      label: t('teacherDashboard.createExam', 'Create Exam'),
      description: t('teacherDashboard.createExamDesc', 'Build a new exam manually'),
      onClick: () => navigate('/teacher/create-exam'),
      gradient: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
    },
    {
      icon: <BookOpen size={20} color="white" />,
      label: t('teacherDashboard.addMaterial', 'Add Material'),
      description: t('teacherDashboard.addMaterialDesc', 'Upload course materials'),
      onClick: () => navigate('/teacher/courses'),
      gradient: 'linear-gradient(135deg, #fb923c, #f97316)',
    },
    {
      icon: <ClipboardList size={20} color="white" />,
      label: t('teacherDashboard.questionBank', 'Question Bank'),
      description: t('teacherDashboard.questionBankDesc', 'Manage saved questions'),
      onClick: () => navigate('/teacher/question-bank'),
      gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((a) => (
        <QuickAction key={a.label} {...a} />
      ))}
    </div>
  );
}
