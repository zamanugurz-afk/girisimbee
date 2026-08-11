-- Backfill public.profiles for auth.users that never got handle_new_user.
-- Idempotent. Does not change roles of existing profiles.

INSERT INTO public.profiles (
  id,
  user_id,
  role,
  display_name,
  first_name,
  last_name,
  username,
  email,
  phone,
  status,
  account_status,
  is_email_verified,
  is_phone_verified,
  is_deleted,
  last_seen_at,
  last_active_at,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.id,
  'user',
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    NULLIF(
      trim(
        concat_ws(
          ' ',
          u.raw_user_meta_data->>'first_name',
          u.raw_user_meta_data->>'last_name'
        )
      ),
      ''
    ),
    split_part(u.email, '@', 1)
  ),
  u.raw_user_meta_data->>'first_name',
  u.raw_user_meta_data->>'last_name',
  NULLIF(lower(u.raw_user_meta_data->>'username'), ''),
  u.email,
  u.raw_user_meta_data->>'phone',
  'active',
  'active',
  COALESCE(u.email_confirmed_at IS NOT NULL, false),
  false,
  false,
  now(),
  now(),
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

INSERT INTO public.user_settings (user_id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_settings s WHERE s.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;
