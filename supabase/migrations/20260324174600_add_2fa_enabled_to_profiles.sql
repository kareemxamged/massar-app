-- Add 2fa_enabled boolean to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS "2fa_enabled" boolean DEFAULT false;

-- Add comment for context
COMMENT ON COLUMN public.profiles."2fa_enabled" IS 'Tracks whether the user has successfully enrolled and verified a Supabase Auth MFA factor (TOTP). Kept in sync by client-side application logic after successful mfa.verify().';
