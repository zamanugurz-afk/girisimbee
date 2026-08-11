-- Enforce one membership per email at the profiles layer (case-insensitive).
-- auth.users already enforces uniqueness; this mirrors it for public.profiles.

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_uidx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL
    AND btrim(email) <> ''
    AND COALESCE(is_deleted, false) = false;
