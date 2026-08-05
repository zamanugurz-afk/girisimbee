-- Reklam & işbirliği admin takip — updated_at trigger + yardımcı indexler.
-- Ana tablo: 20260805150000_create_ad_inquiries.sql
-- Ödeme kolonları: 20260805160000_market_ad_payment.sql

-- updated_at otomatik
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_marketplace_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS trg_marketplace_ad_inquiries_updated_at
      ON public.marketplace_ad_inquiries;
    CREATE TRIGGER trg_marketplace_ad_inquiries_updated_at
      BEFORE UPDATE ON public.marketplace_ad_inquiries
      FOR EACH ROW
      EXECUTE FUNCTION public.set_marketplace_updated_at();
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Yeni özel işbirliği taleplerini hızlı filtrele
CREATE INDEX IF NOT EXISTS marketplace_ad_inquiries_partnership_new_idx
  ON public.marketplace_ad_inquiries (created_at DESC)
  WHERE kind = 'partnership' AND status = 'new';

COMMENT ON COLUMN public.marketplace_ad_inquiries.kind IS
  'market_ad = 5000 TL MARKET yayını; partnership = özel işbirliği talebi (admin takip)';
COMMENT ON COLUMN public.marketplace_ad_inquiries.status IS
  'new → reviewing → accepted|rejected|closed';
COMMENT ON COLUMN public.marketplace_ad_inquiries.partnership_type IS
  'sponsorship | content | event | media | other (yalnızca kind=partnership)';
COMMENT ON COLUMN public.marketplace_ad_inquiries.message IS
  'Özel işbirliği açıklaması / brief';
COMMENT ON COLUMN public.marketplace_ad_inquiries.admin_note IS
  'Admin iç notu — müşteriye gösterilmez';
