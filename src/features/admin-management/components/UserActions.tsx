import { UserX, UserCheck, Edit, Trash2, BarChart2 } from 'lucide-react';

interface Props {
  userId: string;
  status: string;
  onEdit: (id: string) => void;
  onStats: (id: string) => void;
  onConfirmAction: (action: 'suspend' | 'activate' | 'delete', userId: string) => void;
}

export default function UserActions({ 
  userId, 
  status, 
  onEdit,
  onStats,
  onConfirmAction 
}: Props) {
  const isActive = status === 'active';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onStats(userId)}
        className="btn-icon"
        title="View Statistics"
        style={{ color: '#38bdf8' }}
      >
        <BarChart2 size={18} />
      </button>

      {isActive ? (
        <button
          onClick={() => onConfirmAction('suspend', userId)}
          className="btn-icon"
          title="Suspend Account"
          style={{ color: '#fb923c' }}
        >
          <UserX size={18} />
        </button>
      ) : (
        <button
          onClick={() => onConfirmAction('activate', userId)}
          className="btn-icon"
          title="Activate Account"
          style={{ color: '#34d399' }}
        >
          <UserCheck size={18} />
        </button>
      )}
      <button
        onClick={() => onEdit(userId)}
        className="btn-icon"
        title="Edit User"
        style={{ color: '#94a3b8' }}
      >
        <Edit size={18} />
      </button>
      <button
        onClick={() => onConfirmAction('delete', userId)}
        className="btn-icon"
        title="Delete Account"
        style={{ color: '#fb7185' }}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
