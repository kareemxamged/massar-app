export type AuditAction =
  | 'login' | 'logout'
  | 'create_course'   | 'update_course'   | 'delete_course'
  | 'approve_course'  | 'reject_course'
  | 'create_exam'     | 'update_exam'     | 'delete_exam'
  | 'approve_exam'    | 'reject_exam'
  | 'create_material' | 'update_material' | 'delete_material'
  | 'approve_material'| 'reject_material'
  | 'create_user'     | 'update_user'     | 'delete_user'
  | 'change_role'     | 'suspend_user'
  | 'update_settings'
  | 'enroll_student'  | 'unenroll_student';

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action_type: AuditAction;
  entity_affected: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin: { full_name: string | null; email: string | null } | null;
}

export interface AuditFilters {
  adminName?: string;
  actionType?: AuditAction | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface SecurityStats {
  totalLogsToday: number;
  sensitiveActionsLast24h: number;
  deletionsLast24h: number;
  roleChangesLast24h: number;
}

export interface AdminSession {
  id: string;
  full_name: string | null;
  email: string | null;
  last_action_at: string | null;
  last_action_type: string | null;
  actions_today: number;
}

export const ACTION_BADGE: Record<AuditAction, { color: string; bg: string }> = {
  login:            { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  logout:           { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  create_course:    { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  update_course:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  delete_course:    { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  approve_course:   { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  reject_course:    { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  create_exam:      { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  update_exam:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  delete_exam:      { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  approve_exam:     { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  reject_exam:      { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  create_material:  { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  update_material:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  delete_material:  { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  approve_material: { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  reject_material:  { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  create_user:      { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  update_user:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  delete_user:      { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  change_role:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  suspend_user:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  update_settings:  { color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  enroll_student:   { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  unenroll_student: { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
};

export const ALL_ACTIONS = Object.keys(ACTION_BADGE) as AuditAction[];
