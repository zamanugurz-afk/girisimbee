import { describe, it, expect, beforeEach } from 'vitest';
import { getSharedMemoryContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { sendAdInquiryConfirmation } from '@/lib/email/send';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';

describe('Admin Paneli & Yeni Yapı Entegrasyon Testleri', () => {
  let container: ReturnType<typeof getSharedMemoryContainer>;
  const TEST_USER = ids.user('u0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    container = getSharedMemoryContainer();
  });

  describe('1. İlan Yönetimi & Süper İlan / Vitrin Kontrolleri', () => {
    it('İlanların listelenmesi, onaylanması, Süper İlan ve Vitrin yapılması başarıyla çalışır', async () => {
      const { listingRepository, adminService } = container;

      const listing = await listingRepository.create({
        ownerId: TEST_USER,
        title: 'Yeni Nesil B2B AI FinTech Girişimi',
        shortDescription: 'Fatura finansmanı ve yapay zeka destekli nakit akış yönetimi.',
        city: 'İstanbul',
        categoryId: CATEGORY_IDS.yatirimBul,
        listingTypeId: LISTING_TYPE_IDS.seekingInvestmentDefault,
        status: 'published',
        workflowStatus: 'published',
      });

      expect(listing.id).toBeDefined();

      // Süper İlan Yap (mark_urgent)
      const urgentResult = await adminService.markListingUrgent(listing.id, new Date(Date.now() + 86400000).toISOString());
      expect(urgentResult.isUrgent).toBe(true);

      // Vitrin Yap (feature)
      const featuredResult = await adminService.featureListing(listing.id, new Date(Date.now() + 86400000).toISOString());
      expect(featuredResult.isFeatured).toBe(true);

      // Yayından Kaldır (unpublish)
      const unpublished = await adminService.unpublishListing(listing.id);
      expect(unpublished.status).toBe('paused');

      // Yeniden Yayınla (publish)
      const published = await adminService.publishListing(listing.id);
      expect(published.status).toBe('published');

      // Süper İlanı Kaldır (remove_urgent)
      const normalResult = await adminService.removeListingUrgent(listing.id);
      expect(normalResult.isUrgent).toBe(false);

      // Vitrini Kaldır (unfeature)
      const unfeaturedResult = await adminService.unfeatureListing(listing.id);
      expect(unfeaturedResult.isFeatured).toBe(false);
    });
  });

  describe('2. Şirketler & Doğrulama Yönetimi', () => {
    it('Şirket kaydı, admin listelemesi ve doğrulama rozeti toggle işlemi sorunsuz çalışır', async () => {
      const { companyRepository } = container;

      const createdCompany = await companyRepository.create({
        ownerId: TEST_USER,
        name: 'Nexus Teknoloji A.Ş.',
        slug: 'nexus-teknoloji',
        city: 'İstanbul',
        industry: 'Yazılım & AI',
        isVerified: false,
        status: 'active',
      });

      expect(createdCompany.id).toBeDefined();
      expect(createdCompany.isVerified).toBe(false);

      // Doğrula (Verify)
      const verified = await companyRepository.update(createdCompany.id, { isVerified: true });
      expect(verified.isVerified).toBe(true);

      // Onayı Kaldır (Unverify)
      const unverified = await companyRepository.update(createdCompany.id, { isVerified: false });
      expect(unverified.isVerified).toBe(false);

      // Askıya Al (Suspend)
      const suspended = await companyRepository.update(createdCompany.id, { status: 'suspended' });
      expect(suspended.status).toBe('suspended');
    });
  });

  describe('3. Moderasyon / Şikayetler (Reports) Akışı', () => {
    it('Kullanıcı şikayet kaydı oluşturabilir, admin listeleyip karara bağlayabilir', async () => {
      const { reportRepository, listingRepository, adminService } = container;

      const listing = await listingRepository.create({
        ownerId: TEST_USER,
        title: 'Şüpheli İlan Başlığı',
        shortDescription: 'Şikayete konu olan ilan açıklaması',
        categoryId: CATEGORY_IDS.yatirimBul,
        listingTypeId: LISTING_TYPE_IDS.seekingInvestmentDefault,
        status: 'published',
        workflowStatus: 'published',
      });

      // Kullanıcı şikayet eder
      const report = await reportRepository.create({
        reporterUserId: TEST_USER,
        entityType: 'listing',
        entityId: listing.id,
        reason: 'fraud',
        details: 'Bu ilanda yanıltıcı bilgi bulunmaktadır.',
        status: 'submitted',
      });

      expect(report.id).toBeDefined();
      expect(report.status).toBe('submitted');

      // Admin şikayetleri sayar
      const pendingCount = await reportRepository.count({ status: 'submitted' });
      expect(pendingCount).toBeGreaterThanOrEqual(1);

      // Admin şikayeti çözüme kavuşturur ve ilanı yayından kaldırır
      await reportRepository.update(report.id, {
        status: 'resolved',
        resolutionNote: 'İlan incelendi ve sahtecilik nedeniyle yayından kaldırıldı.',
        resolvedAt: new Date().toISOString(),
      });

      await adminService.unpublishListing(listing.id);

      const resolvedReport = await reportRepository.findById(report.id);
      expect(resolvedReport?.status).toBe('resolved');

      const updatedListing = await listingRepository.findById(listing.id);
      expect(updatedListing?.status).toBe('paused');
    });
  });

  describe('4. İletişim Talepleri & Güvenlik Denetimi', () => {
    it('İletişim talepleri ve izin kayıtları admin tarafından denetlenebilir', async () => {
      const { contactRequestRepository, listingRepository } = container;

      const listing = await listingRepository.create({
        ownerId: TEST_USER,
        title: 'Gizli Bilgili Girişim',
        shortDescription: 'İletişim için talep gerektiren ilan',
        categoryId: CATEGORY_IDS.yatirimBul,
        listingTypeId: LISTING_TYPE_IDS.seekingInvestmentDefault,
        status: 'published',
        workflowStatus: 'published',
      });

      const otherUserId = ids.user('u0000000-0000-4000-8000-000000000099');

      const req = await contactRequestRepository.create({
        listingId: listing.id,
        requesterUserId: otherUserId,
        ownerUserId: TEST_USER,
        message: 'Girişiminizle ilgileniyorum, tanışmak isterim.',
        status: 'pending',
      });

      expect(req.id).toBeDefined();
      expect(req.status).toBe('pending');

      // Talep sahibi veya ilan sahibi kabul/ret veya admin süre doldurma işlemi yapabilir
      const updated = await contactRequestRepository.update(req.id, {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      });

      expect(updated.status).toBe('accepted');
    });
  });

  describe('5. E-posta ve Bildirim Gönderimi Emniyeti', () => {
    it('Reklam ve iş birliği onay e-postası şablonu hatasız derlenir ve gönderim güvenlidir', async () => {
      await expect(
        sendAdInquiryConfirmation({
          to: 'test@girisimbee.com',
          fullName: 'Ahmet Yılmaz',
          kind: 'market_ad',
          inquiryId: 'INQ-12345',
        }),
      ).resolves.not.toThrow();

      await expect(
        sendAdInquiryConfirmation({
          to: 'partner@girisimbee.com',
          fullName: 'Zeynep Kaya',
          kind: 'partnership',
          inquiryId: 'INQ-67890',
        }),
      ).resolves.not.toThrow();
    });
  });
});
