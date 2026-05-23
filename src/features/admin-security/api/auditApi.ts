import { getServiceClient } from '../../../services/supabase';
import type { AuditLog, AuditFilters, SecurityStats, AdminSession, AuditAction } from '../types';

const svc = getServiceClient();
export const PAGE_SIZE = 25;

export const auditApi = {
  async getAuditLogs(
    filters: AuditFilters,
    page: number,
  ): Promise<{ data: AuditLog[]; count: number }> {
    const from = page * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let query = svc
      .from('audit_logs')
      .select('*, admin:profiles!audit_logs_admin_id_fkey(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters.actionType) query = query.eq('action_type', filters.actionType);
    if (filters.dateFrom)   query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo)     query = query.lte('created_at', `${filters.dateTo}T23:59:59Z`);

    const { data, error, count } = await query;
    if (error) throw error;

    let logs = ((data ?? []) as Record<string, unknown>[]).map(row => ({
      ...row,
      admin: Array.isArray(row.admin) ? (row.admin[0] ?? null) : row.admin,
    })) as AuditLog[];

    if (filters.adminName?.trim()) {
      const q = filters.adminName.trim().toLowerCase();
      logs = logs.filter(l =>
        l.admin?.full_name?.toLowerCase().includes(q) ||
        l.admin?.email?.toLowerCase().includes(q),
      );
    }

    return { data: logs, count: count ?? 0 };
  },

  async getSecurityStats(): Promise<SecurityStats> {
    const now          = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const last24h      = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const sensitiveActions: AuditAction[] = [
      'delete_user', 'delete_course', 'delete_exam', 'delete_material',
      'change_role', 'suspend_user',
    ];
    const deletionActions: AuditAction[] = ['delete_user', 'delete_course', 'delete_exam', 'delete_material'];
    const roleActions:     AuditAction[] = ['change_role', 'suspend_user'];

    const [todayRes, sensitiveRes, deletionsRes, roleRes] = await Promise.all([
      svc.from('audit_logs').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfToday),
      svc.from('audit_logs').select('*', { count: 'exact', head: true })
        .in('action_type', sensitiveActions).gte('created_at', last24h),
      svc.from('audit_logs').select('*', { count: 'exact', head: true })
        .in('action_type', deletionActions).gte('created_at', last24h),
      svc.from('audit_logs').select('*', { count: 'exact', head: true })
        .in('action_type', roleActions).gte('created_at', last24h),
    ]);

    return {
      totalLogsToday:        todayRes.count    ?? 0,
      sensitiveActionsLast24h: sensitiveRes.count ?? 0,
      deletionsLast24h:      deletionsRes.count ?? 0,
      roleChangesLast24h:    roleRes.count      ?? 0,
    };
  },

  async logAction(
    adminId: string | null,
    action: AuditAction,
    entity: string,
    entityId?: string | null,
    oldData?: Record<string, unknown> | null,
    newData?: Record<string, unknown> | null,
  ): Promise<void> {
    try {
      await svc.from('audit_logs').insert({
        admin_id:        adminId,
        action_type:     action,
        entity_affected: entity,
        entity_id:       entityId  ?? null,
        old_data:        oldData   ?? null,
        new_data:        newData   ?? null,
      });
    } catch {
      // fire-and-forget — never throws
    }
  },

  async getAdminSessions(): Promise<AdminSession[]> {
    const { data: admins, error } = await svc
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'admin');
    if (error) throw error;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const results = await Promise.all(
      (admins ?? []).map(async (admin) => {
        const { data: lastLog } = await svc
          .from('audit_logs')
          .select('created_at, action_type')
          .eq('admin_id', admin.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count } = await svc
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('admin_id', admin.id)
          .gte('created_at', startOfToday.toISOString());

        const log = lastLog as Record<string, unknown> | null;
        return {
          id:               admin.id as string,
          full_name:        admin.full_name as string | null,
          email:            admin.email as string | null,
          last_action_at:   log?.created_at   as string | null ?? null,
          last_action_type: log?.action_type  as string | null ?? null,
          actions_today:    count ?? 0,
        } satisfies AdminSession;
      }),
    );

    return results;
  },

  PAGE_SIZE,
};
