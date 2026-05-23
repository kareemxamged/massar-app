import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface MaintenanceState {
  maintenanceMode:    boolean;
  maintenanceMessage: string;
  broadcastMessage:   string | null;
  siteName:           string;
}

export function useMaintenanceMode(): MaintenanceState & { loading: boolean } {
  const [state, setState] = useState<MaintenanceState>({
    maintenanceMode:    false,
    maintenanceMessage: '',
    broadcastMessage:   null,
    siteName:           'Exam Management System',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const apply = (row: Record<string, unknown>) => {
      setState({
        maintenanceMode:    (row.maintenance_mode    as boolean)       ?? false,
        maintenanceMessage: (row.maintenance_message as string)        ?? '',
        broadcastMessage:   (row.broadcast_message   as string | null) ?? null,
        siteName:           (row.site_name           as string)        ?? 'Exam Management System',
      });
    };

    supabase
      .from('system_settings')
      .select('maintenance_mode, maintenance_message, broadcast_message, site_name')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (mounted && data) apply(data as Record<string, unknown>);
        if (mounted) setLoading(false);
      });

    const channel = supabase
      .channel('system-settings-watch')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'system_settings', filter: 'id=eq.1' },
        (payload) => { if (mounted) apply(payload.new as Record<string, unknown>); },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { ...state, loading };
}
