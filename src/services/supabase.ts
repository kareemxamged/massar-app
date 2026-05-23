import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// SINGLETON PATTERN - Prevent Multiple GoTrueClient Instances
// ============================================================

// Anonymous client singleton
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseClient
}

// Default export for convenience
export const supabase = getSupabaseClient()

// Service role client singleton (separate from anon client)
let serviceClient: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceKey) {
      throw new Error('Service role key not available')
    }
    
    serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  
  return serviceClient
}
