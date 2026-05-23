/**
 * DB Fix + Admin Setup Edge Function
 * One-time use: fixes the broken handle_new_user trigger and creates master admin.
 * Deploy → Call Once → Delete.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

  if (!serviceRoleKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: Record<string, unknown> = {};

  // ─── Step 1: Fix trigger via postgres RPC ───────────────────────────────────
  // Use the pg connection available inside edge functions via SUPABASE_DB_URL
  const dbUrl = Deno.env.get('SUPABASE_DB_URL');
  if (dbUrl) {
    try {
      const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
      const client = new Client(dbUrl);
      await client.connect();

      // Fix handle_new_user trigger to not reference student_id
      await client.queryObject(`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = public
        AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, full_name, role, status)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role),
            'active'
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
          RETURN NEW;
        END;
        $$;
      `);
      results.trigger_fixed = true;

      // Set status default
      await client.queryObject(`ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'active';`);
      results.status_default_set = true;

      // Drop any broken triggers on profiles (other than FK triggers)
      const { rows } = await client.queryObject<{ tgname: string }>(
        `SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass AND tgname NOT LIKE 'RI_%'`
      );
      for (const row of rows) {
        await client.queryObject(`DROP TRIGGER IF EXISTS ${row.tgname} ON public.profiles`);
      }
      results.profiles_triggers_dropped = rows.map((r) => r.tgname);

      await client.end();
    } catch (err) {
      results.pg_error = String(err);
    }
  } else {
    results.pg_skipped = 'SUPABASE_DB_URL not available';
  }

  // ─── Step 2: Create master admin auth user ───────────────────────────────────
  const adminEmail = 'admin@exam-system.io';
  const adminPassword = 'Admin@2026!Secure';
  const adminName = 'Master Administrator';

  // Check if already exists
  const { data: existingList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = existingList?.users?.find((u) => u.email === adminEmail);

  if (existing) {
    results.admin_user = 'already_exists';
    results.admin_id = existing.id;
    // Update password just in case
    await supabase.auth.admin.updateUserById(existing.id, {
      password: adminPassword,
      email_confirm: true,
    });
    results.password_updated = true;
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName, role: 'admin' },
    });

    if (createErr) {
      results.admin_create_error = createErr.message;
    } else {
      results.admin_user = 'created';
      results.admin_id = newUser.user.id;
    }
  }

  // ─── Step 3: Ensure admin profile has role=admin ─────────────────────────────
  if (results.admin_id) {
    const { error: profErr } = await supabase
      .from('profiles')
      .update({ full_name: adminName, role: 'admin', status: 'active', updated_at: new Date().toISOString() })
      .eq('id', results.admin_id as string);

    results.profile_updated = profErr ? profErr.message : true;
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
