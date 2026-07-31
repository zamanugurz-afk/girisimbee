-- P0: RLS policies for ecosystem tables

-- ── Subcategories ───────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_subcategories_public_read ON public.marketplace_subcategories;
CREATE POLICY marketplace_subcategories_public_read
  ON public.marketplace_subcategories FOR SELECT TO anon, authenticated
  USING (status = 'active' AND deleted_at IS NULL);

DROP POLICY IF EXISTS marketplace_subcategories_admin_write ON public.marketplace_subcategories;
CREATE POLICY marketplace_subcategories_admin_write
  ON public.marketplace_subcategories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Profile modules ───────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_profile_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_profile_modules_owner_all ON public.marketplace_profile_modules;
CREATE POLICY marketplace_profile_modules_owner_all
  ON public.marketplace_profile_modules FOR ALL TO authenticated
  USING (public.is_profile_owner(profile_id))
  WITH CHECK (public.is_profile_owner(profile_id));

-- ── Module profile tables (owner-only write; public read when profile published) ─

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'entrepreneur_profiles',
    'investor_profiles',
    'candidate_profiles',
    'employer_profiles',
    'founder_profiles',
    'franchise_profiles'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I_owner_all ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I_owner_all ON public.%I FOR ALL TO authenticated USING (public.is_profile_owner(profile_id)) WITH CHECK (public.is_profile_owner(profile_id))',
      tbl, tbl
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_public_read ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I_public_read ON public.%I FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.marketplace_profiles p WHERE p.id = profile_id AND p.status = ''published'' AND p.deleted_at IS NULL AND p.visibility = ''public''))',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Candidate profiles: employers see anonymized fields only via application flow (handled in service layer)
-- Additional policy: listing owners can read candidate profile when application is unlocked
DROP POLICY IF EXISTS candidate_profiles_unlocked_application_read ON public.candidate_profiles;
CREATE POLICY candidate_profiles_unlocked_application_read
  ON public.candidate_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.marketplace_applications a
      JOIN public.marketplace_listings l ON l.id = a.listing_id
      WHERE a.applicant_profile_id = candidate_profiles.profile_id
        AND a.deleted_at IS NULL
        AND a.unlocked_at IS NOT NULL
        AND public.can_manage_listing(l.id)
    )
  );

-- ── Matches ─────────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_matches_participant_read ON public.marketplace_matches;
CREATE POLICY marketplace_matches_participant_read
  ON public.marketplace_matches FOR SELECT TO authenticated
  USING (public.is_match_participant(id));

DROP POLICY IF EXISTS marketplace_matches_initiator_insert ON public.marketplace_matches;
CREATE POLICY marketplace_matches_initiator_insert
  ON public.marketplace_matches FOR INSERT TO authenticated
  WITH CHECK (
    public.is_profile_owner(initiator_profile_id)
    AND initiator_profile_id = public.marketplace_profile_id_for_user()
  );

DROP POLICY IF EXISTS marketplace_matches_participant_update ON public.marketplace_matches;
CREATE POLICY marketplace_matches_participant_update
  ON public.marketplace_matches FOR UPDATE TO authenticated
  USING (public.is_match_participant(id))
  WITH CHECK (public.is_match_participant(id));

DROP POLICY IF EXISTS marketplace_matches_admin_all ON public.marketplace_matches;
CREATE POLICY marketplace_matches_admin_all
  ON public.marketplace_matches FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Applications ────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_applications_applicant_insert ON public.marketplace_applications;
CREATE POLICY marketplace_applications_applicant_insert
  ON public.marketplace_applications FOR INSERT TO authenticated
  WITH CHECK (
    public.is_profile_owner(applicant_profile_id)
    AND applicant_profile_id = public.marketplace_profile_id_for_user()
  );

DROP POLICY IF EXISTS marketplace_applications_applicant_read ON public.marketplace_applications;
CREATE POLICY marketplace_applications_applicant_read
  ON public.marketplace_applications FOR SELECT TO authenticated
  USING (public.is_application_applicant(id));

DROP POLICY IF EXISTS marketplace_applications_manager_read ON public.marketplace_applications;
CREATE POLICY marketplace_applications_manager_read
  ON public.marketplace_applications FOR SELECT TO authenticated
  USING (public.can_manage_application(id));

DROP POLICY IF EXISTS marketplace_applications_applicant_update ON public.marketplace_applications;
CREATE POLICY marketplace_applications_applicant_update
  ON public.marketplace_applications FOR UPDATE TO authenticated
  USING (public.is_application_applicant(id))
  WITH CHECK (public.is_application_applicant(id));

DROP POLICY IF EXISTS marketplace_applications_manager_update ON public.marketplace_applications;
CREATE POLICY marketplace_applications_manager_update
  ON public.marketplace_applications FOR UPDATE TO authenticated
  USING (public.can_manage_application(id))
  WITH CHECK (public.can_manage_application(id));

DROP POLICY IF EXISTS marketplace_applications_admin_all ON public.marketplace_applications;
CREATE POLICY marketplace_applications_admin_all
  ON public.marketplace_applications FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Documents ─────────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_documents_public_read ON public.marketplace_documents;
CREATE POLICY marketplace_documents_public_read
  ON public.marketplace_documents FOR SELECT TO anon, authenticated
  USING (visibility = 'public' AND deleted_at IS NULL);

DROP POLICY IF EXISTS marketplace_documents_owner_all ON public.marketplace_documents;
CREATE POLICY marketplace_documents_owner_all
  ON public.marketplace_documents FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_profiles p
      WHERE p.id = owner_profile_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.marketplace_profiles p
      WHERE p.id = owner_profile_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS marketplace_documents_match_read ON public.marketplace_documents;
CREATE POLICY marketplace_documents_match_read
  ON public.marketplace_documents FOR SELECT TO authenticated
  USING (
    visibility = 'match_only'
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.marketplace_matches m
      WHERE m.status IN ('accepted', 'contacted', 'closed_won')
        AND public.is_match_participant(m.id)
        AND (
          m.initiator_profile_id = owner_profile_id
          OR m.target_profile_id = owner_profile_id
        )
    )
  );

DROP POLICY IF EXISTS marketplace_documents_application_read ON public.marketplace_documents;
CREATE POLICY marketplace_documents_application_read
  ON public.marketplace_documents FOR SELECT TO authenticated
  USING (
    visibility = 'application_only'
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.marketplace_applications a
      WHERE a.applicant_profile_id = owner_profile_id
        AND a.deleted_at IS NULL
        AND public.can_view_application_pii(a.id)
    )
  );

-- Storage policies for marketplace-documents bucket
DROP POLICY IF EXISTS marketplace_documents_storage_owner_upload ON storage.objects;
CREATE POLICY marketplace_documents_storage_owner_upload
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'marketplace-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS marketplace_documents_storage_owner_read ON storage.objects;
CREATE POLICY marketplace_documents_storage_owner_read
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'marketplace-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS marketplace_documents_storage_owner_delete ON storage.objects;
CREATE POLICY marketplace_documents_storage_owner_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'marketplace-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── Payments ──────────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_payments_owner_read ON public.marketplace_payments;
CREATE POLICY marketplace_payments_owner_read
  ON public.marketplace_payments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS marketplace_payments_owner_insert ON public.marketplace_payments;
CREATE POLICY marketplace_payments_owner_insert
  ON public.marketplace_payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS marketplace_payments_admin_all ON public.marketplace_payments;
CREATE POLICY marketplace_payments_admin_all
  ON public.marketplace_payments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Service role handles webhook status updates (bypasses RLS)
