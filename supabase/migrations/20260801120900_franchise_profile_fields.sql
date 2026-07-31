-- P4: Franchise profile buy/give field columns

ALTER TABLE public.franchise_profiles
  ADD COLUMN IF NOT EXISTS ad_soyad TEXT,
  ADD COLUMN IF NOT EXISTS minimum_yatirim NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS maksimum_yatirim NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS tercih_edilen_lokasyon TEXT,
  ADD COLUMN IF NOT EXISTS isletme_tecrubesi TEXT,
  ADD COLUMN IF NOT EXISTS aciklama TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS eposta TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS marka_adi TEXT,
  ADD COLUMN IF NOT EXISTS minimum_sermaye NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS tahmini_aylik_ciro NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS sube_sayisi INT,
  ADD COLUMN IF NOT EXISTS egitim_destegi BOOLEAN,
  ADD COLUMN IF NOT EXISTS operasyon_destegi BOOLEAN,
  ADD COLUMN IF NOT EXISTS pazarlama_destegi BOOLEAN;

CREATE INDEX IF NOT EXISTS franchise_profiles_marka_adi_idx
  ON public.franchise_profiles (marka_adi) WHERE marka_adi IS NOT NULL;

CREATE INDEX IF NOT EXISTS franchise_profiles_ad_soyad_idx
  ON public.franchise_profiles (ad_soyad) WHERE ad_soyad IS NOT NULL;
