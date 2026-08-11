import type { ConsentRetentionProcedure } from '@/features/admin/consent-procedures/types/consent-procedure.types';

const NOW = '2026-08-01T10:00:00.000Z';

function row(
  partial: Omit<ConsentRetentionProcedure, 'updatedAt' | 'updatedBy' | 'status' | 'version'> & {
    status?: ConsentRetentionProcedure['status'];
    version?: string;
  },
): ConsentRetentionProcedure {
  return {
    status: 'active',
    version: '2026-08-01',
    updatedAt: NOW,
    updatedBy: 'system',
    ...partial,
  };
}

/** Seed playbooks aligned with live consent tables / admin APIs. */
export const SEED_CONSENT_PROCEDURES: ConsentRetentionProcedure[] = [
  row({
    id: 'proc_signup_terms',
    code: 'signup.terms',
    title: 'Kullanıcı sözleşmesi onayı',
    category: 'signup',
    summary: 'Kayıt sırasında kabul edilen kullanıcı sözleşmesi bayrağı ve zaman damgası.',
    legalBasis: 'Sözleşmenin kurulması (TBK) + elektronik ortamda açık kabul',
    storageLocation: 'public.user_consents (terms_accepted, terms_accepted_at)',
    storageProcedure:
      '1) Kullanıcı kayıt formunda sözleşmeyi işaretler.\n'
      + '2) Hesap oluşturma servisi user_consents satırını upsert eder.\n'
      + '3) terms_accepted=true ve terms_accepted_at=now yazılır.\n'
      + '4) Metin versiyonu yasal sayfa (/yasal/kullanici-sozlesmesi) üzerinden yayınlanır; bayrak bu versiyona bağlı kabul sayılır.',
    retentionPeriod: 'Hesap silinene kadar + yasal zorunluluk süresince (önerilen: silme + 10 yıl)',
    retrievalProcedure:
      '1) Yönetim → Kullanıcılar → ilgili kullanıcıyı aç.\n'
      + '2) Hesap / onaylar kartında “Kullanıcı sözleşmesi” satırını kontrol et.\n'
      + '3) Gerekirse Supabase user_consents tablosundan user_id ile kayıt çek.\n'
      + '4) Talep eden makama: kullanıcı kimliği, kabul zamanı ve o tarihteki sözleşme metni linkini ilet.',
    retrievalAdminPath: '/admin/users',
    retrievalApiPath: '',
    evidenceFormat: 'Ekran kaydı + user_consents satırı (JSON) + yasal metin URL’si',
    slaHours: 24,
    ownerRole: 'admin',
  }),
  row({
    id: 'proc_signup_privacy',
    code: 'signup.privacy',
    title: 'Gizlilik politikası onayı',
    category: 'signup',
    summary: 'Kayıt sırasında gizlilik politikasının okunup kabul edildiğine dair kayıt.',
    legalBasis: 'KVKK md. 10 aydınlatma + politika kabulü',
    storageLocation: 'public.user_consents (privacy_accepted, privacy_accepted_at)',
    storageProcedure:
      '1) Kayıt formunda gizlilik kutusu zorunlu tutulur.\n'
      + '2) user_consents.privacy_accepted / privacy_accepted_at yazılır.\n'
      + '3) Güncel metin /yasal/gizlilik adresinde yayınlanır.',
    retentionPeriod: 'Hesap silinene kadar + silme sonrası 10 yıl (önerilen)',
    retrievalProcedure:
      '1) /admin/users üzerinden kullanıcı onaylarını görüntüle.\n'
      + '2) user_consents kaydını user_id ile doğrula.\n'
      + '3) Kabul anındaki politika metni için /yasal/gizlilik ve yayın tarihini ekle.',
    retrievalAdminPath: '/admin/users',
    retrievalApiPath: '',
    evidenceFormat: 'Onay bayrağı + zaman damgası + politika URL',
    slaHours: 24,
    ownerRole: 'admin',
  }),
  row({
    id: 'proc_signup_kvkk',
    code: 'signup.kvkk',
    title: 'Kayıt KVKK onayı',
    category: 'signup',
    summary: 'Üyelik oluştururken verilen genel KVKK / aydınlatma onayı.',
    legalBasis: 'KVKK aydınlatma + açık rıza (işleme amacına göre)',
    storageLocation: 'public.user_consents (kvkk_accepted, kvkk_accepted_at)',
    storageProcedure:
      '1) Kayıt formunda KVKK onayı alınır.\n'
      + '2) user_consents.kvkk_* alanları güncellenir.\n'
      + '3) Aydınlatma metni /yasal/kvkk-aydinlatma üzerinden sunulur.',
    retentionPeriod: 'İşleme amacı sona erene kadar; sonrasında silme / anonimleştirme politikasına uy',
    retrievalProcedure:
      '1) Kullanıcı detayından KVKK onay satırını kontrol et.\n'
      + '2) İstenirse yasal aydınlatma metni PDF/ekran çıktısı ekle.\n'
      + '3) İlan veya CV özel rızaları varsa ilgili prosedüre yönlendir (publish.* / job_seeker.*).',
    retrievalAdminPath: '/admin/users',
    retrievalApiPath: '',
    evidenceFormat: 'user_consents kaydı + aydınlatma metni',
    slaHours: 24,
    ownerRole: 'legal',
  }),
  row({
    id: 'proc_cookie',
    code: 'cookie.policy',
    title: 'Çerez politikası onayı',
    category: 'cookie',
    summary: 'Çerez tercih / politika kabulünün hesap düzeyinde saklanması.',
    legalBasis: 'Elektronik Haberleşme Kanunu + KVKK (çerez türüne göre)',
    storageLocation: 'public.user_consents (cookies_accepted, cookies_accepted_at) + tarayıcı tercihi',
    storageProcedure:
      '1) Kullanıcı çerez bildirimini / politikayı kabul eder.\n'
      + '2) Oturum açılmışsa user_consents.cookies_* güncellenir.\n'
      + '3) Politik metin /yasal/cerez adresinde tutulur.',
    retentionPeriod: 'Tercih değişene veya hesap silinene kadar',
    retrievalProcedure:
      '1) Hesap onaylarından çerez satırını kontrol et.\n'
      + '2) Anonim ziyaretçi için yalnızca tarayıcı tarafı kayıt varsa bunu belirt (sunucu kanıtı sınırlı olabilir).',
    retrievalAdminPath: '/admin/users',
    retrievalApiPath: '',
    evidenceFormat: 'Onay bayrağı + çerez politikası URL',
    slaHours: 48,
    ownerRole: 'admin',
  }),
  row({
    id: 'proc_publish_clarification',
    code: 'publish.clarification',
    title: 'İlan yayın — aydınlatma metni onayı',
    category: 'publish',
    summary: 'İlan yayın sihirbazında alınan aydınlatma onayı (publish consent policy).',
    legalBasis: 'KVKK md. 10 aydınlatma',
    storageLocation:
      'İlan yayın payload / listing metadata içindeki publish consents + politika sürümü PUBLISH_CONSENT_VERSION',
    storageProcedure:
      '1) Yayın adımında clarificationText zorunlu işaretlenir.\n'
      + '2) Onay değerleri ilan kaydıyla birlikte saklanır (publish consent alanları).\n'
      + '3) Politika metni features/kvkk publish-consent-policy sabitleriyle versiyonlanır.',
    retentionPeriod: 'İlan yayında kaldığı süre + silme sonrası yasal süre',
    retrievalProcedure:
      '1) Yönetim → İlanlar → ilgili ilanı aç; yayın onay alanlarını kontrol et.\n'
      + '2) Politika sürümünü (PUBLISH_CONSENT_VERSION) not et.\n'
      + '3) Gerekirse ilan sahibi user_consents ve iletişim (telefon) izinlerini de ekle.',
    retrievalAdminPath: '/admin/listings',
    retrievalApiPath: '',
    evidenceFormat: 'İlan onay snapshot + politika versiyonu',
    slaHours: 24,
    ownerRole: 'admin',
  }),
  row({
    id: 'proc_publish_phone',
    code: 'publish.phone_display',
    title: 'İlan yayın — telefon paylaşım izni',
    category: 'publish',
    summary: 'Doğrulanmış telefonun ilanda görüntülenmesine verilen izin.',
    legalBasis: 'Açık rıza (iletişim verisinin kamuya açık ilanda gösterimi)',
    storageLocation: 'İlan publish consents.phoneDisplay + profil telefon doğrulama kaydı',
    storageProcedure:
      '1) Kullanıcı telefonunu doğrular.\n'
      + '2) Yayın formunda phoneDisplay iznini verir.\n'
      + '3) İlan kartında telefon yalnızca izin + doğrulama varsa gösterilir.',
    retentionPeriod: 'İlan süresi + itiraz / uyuşmazlık süresi',
    retrievalProcedure:
      '1) İlan kaydında phoneDisplay=true olduğunu doğrula.\n'
      + '2) Telefon doğrulama zamanını profil/doğrulama kayıtlarından ekle.\n'
      + '3) Talep eden tarafa: izin anı, ilan ID, maskelenmiş/şifresiz gereksinime göre numara politikasını uygula.',
    retrievalAdminPath: '/admin/listings',
    retrievalApiPath: '',
    evidenceFormat: 'Publish consent + doğrulama kaydı',
    slaHours: 24,
    ownerRole: 'admin',
  }),
  row({
    id: 'proc_publish_explicit',
    code: 'publish.explicit_consent',
    title: 'İlan yayın — açık rıza',
    category: 'publish',
    summary: 'İlanın yayınlanması ve iletişim amacıyla kişisel veri işlemeye açık rıza.',
    legalBasis: 'KVKK md. 5/1 açık rıza',
    storageLocation: 'Publish consents.explicitConsent + ilan ID bağları',
    storageProcedure:
      '1) Yayın adımında explicitConsent zorunlu.\n'
      + '2) Onay, ilan oluşturma işlemiyle atomik kaydedilir.\n'
      + '3) Red durumunda yayın engellenir.',
    retentionPeriod: 'İşleme amacı + yasal saklama süresi',
    retrievalProcedure:
      '1) İlan detayından açık rıza bayrağını ve yayın zamanını çıkar.\n'
      + '2) Politika metnini (PUBLISH_CONSENT_POLICY_ITEMS.explicitConsent) ekle.\n'
      + '3) Kullanıcı kimliği ve IP/UA varsa (kaynak servisten) belgeye ekle.',
    retrievalAdminPath: '/admin/listings',
    retrievalApiPath: '',
    evidenceFormat: 'Onay snapshot + politika maddesi',
    slaHours: 24,
    ownerRole: 'legal',
  }),
  row({
    id: 'proc_job_cv',
    code: 'job_seeker.cv_sharing',
    title: 'İş arayan — CV paylaşım izni',
    category: 'job_seeker',
    summary: 'Özgeçmişin ilan sahipleri / platform tarafından görüntülenmesi izni.',
    legalBasis: 'Açık rıza',
    storageLocation:
      'public.marketplace_kvkk_consent_records (consent_items / consents.cvSharing) — append-only',
    storageProcedure:
      '1) İş arayan ilan yayınında KVKK kutuları zorunlu.\n'
      + '2) KvkkConsentService kayıt oluşturur (versiyon + maddeler dondurulmuş snapshot).\n'
      + '3) Tablo append-only; güncelleme/silme tetikleyicilerle engellenir.',
    retentionPeriod: 'Append-only denetim izi — yasal süre boyunca silinmez',
    retrievalProcedure:
      '1) GET /api/admin/kvkk-consents?listingId=… veya profileId=…\n'
      + '2) İlgili kaydı seç; consents.cvSharing ve consented_at alanlarını belgeye aktar.\n'
      + '3) evidence=true ile kanıt belgesi üret (aşağıdaki evidence prosedürü).',
    retrievalAdminPath: '/admin/izin-saklama',
    retrievalApiPath: '/api/admin/kvkk-consents',
    evidenceFormat: 'KVKK onay kaydı JSON + isteğe bağlı resmi kanıt belgesi',
    slaHours: 8,
    ownerRole: 'super_admin',
  }),
  row({
    id: 'proc_job_third_party',
    code: 'job_seeker.third_party',
    title: 'İş arayan — üçüncü taraf paylaşım izni',
    category: 'job_seeker',
    summary: 'Verilerin iş ortakları / hizmet sağlayıcılarla paylaşımına rıza.',
    legalBasis: 'Açık rıza',
    storageLocation: 'marketplace_kvkk_consent_records.consents.thirdPartySharing',
    storageProcedure:
      '1) Yayın formunda thirdPartySharing işaretlenir.\n'
      + '2) Append-only KVKK kaydına snapshot olarak yazılır.',
    retentionPeriod: 'Append-only denetim izi',
    retrievalProcedure:
      '1) /api/admin/kvkk-consents ile listingId/profileId sorgula.\n'
      + '2) consent_items içinden thirdPartySharing maddesini ve accepted bayrağını çıkar.',
    retrievalAdminPath: '/admin/izin-saklama',
    retrievalApiPath: '/api/admin/kvkk-consents',
    evidenceFormat: 'KVKK kayıt JSON',
    slaHours: 8,
    ownerRole: 'super_admin',
  }),
  row({
    id: 'proc_job_employer',
    code: 'job_seeker.employer',
    title: 'İş arayan — işveren paylaşım izni',
    category: 'job_seeker',
    summary: 'Profil / CV’nin ilgili işverenlerle paylaşılmasına rıza.',
    legalBasis: 'Açık rıza',
    storageLocation: 'marketplace_kvkk_consent_records.consents.employerSharing',
    storageProcedure:
      '1) employerSharing onayı alınır.\n'
      + '2) KVKK audit kaydına yazılır (versiyonlu madde metniyle birlikte).',
    retentionPeriod: 'Append-only denetim izi',
    retrievalProcedure:
      '1) Admin KVKK API’sinden kaydı çek.\n'
      + '2) İşveren paylaşım maddesini ve zaman damgasını kanıta ekle.\n'
      + '3) İlgili ilan / işveren bağlamını listing_id ile bağla.',
    retrievalAdminPath: '/admin/izin-saklama',
    retrievalApiPath: '/api/admin/kvkk-consents',
    evidenceFormat: 'KVKK kayıt JSON',
    slaHours: 8,
    ownerRole: 'super_admin',
  }),
  row({
    id: 'proc_job_bundle',
    code: 'job_seeker.clarification_explicit',
    title: 'İş arayan — aydınlatma + açık rıza paketi',
    category: 'job_seeker',
    summary: 'CV yayınında aydınlatma ve genel açık rıza maddelerinin birlikte saklanması.',
    legalBasis: 'KVKK md. 10 + md. 5/1',
    storageLocation: 'marketplace_kvkk_consent_records (clarificationText, explicitConsent)',
    storageProcedure:
      '1) Tüm KVKK_CONSENT_KEYS kabul edilmeden yayın tamamlanmaz.\n'
      + '2) consent_version = KVKK_CONSENT_VERSION dondurulur.\n'
      + '3) IP / user-agent mümkünse kayda eklenir.',
    retentionPeriod: 'Append-only denetim izi',
    retrievalProcedure:
      '1) listingId veya profileId ile kayıtları listele.\n'
      + '2) consent_version ve consented_at alanlarını belgeye yaz.\n'
      + '3) Resmi belge için evidence endpoint’ini kullan.',
    retrievalAdminPath: '/admin/izin-saklama',
    retrievalApiPath: '/api/admin/kvkk-consents',
    evidenceFormat: 'KVKK kayıt + kanıt belgesi',
    slaHours: 8,
    ownerRole: 'legal',
  }),
  row({
    id: 'proc_evidence_doc',
    code: 'evidence.kvkk_certificate',
    title: 'KVKK onay kayıt belgesi üretimi',
    category: 'evidence',
    summary: 'İstenildiğinde sunulacak resmi KVKK açık rıza / onay kayıt belgesi.',
    legalBasis: 'İspat yükü / denetim belgesi',
    storageLocation:
      'Kaynak: marketplace_kvkk_consent_records · Üretim: /api/admin/kvkk-consents/[id]/evidence',
    storageProcedure:
      '1) Asıl rıza kaydı append-only tabloda tutulur.\n'
      + '2) Belge talep anında build-kvkk-evidence ile üretilir (saklanan kayıttan türetilir).\n'
      + '3) Belge içeriği kayıt anındaki madde metinlerini yansıtır.',
    retentionPeriod: 'Kaynak kayıt süresince belge yeniden üretilebilir',
    retrievalProcedure:
      '1) Bu ekrandan ilgili izin prosedürünü aç; retrievalApiPath’i izle.\n'
      + '2) GET /api/admin/kvkk-consents?listingId=… ile kayıt ID’sini bul.\n'
      + '3) GET /api/admin/kvkk-consents/{id}/evidence ile belgeyi indir / kopyala.\n'
      + '4) Talep sahibine: belge + kayıt ID + consent_version + SLA içinde teslim notu.',
    retrievalAdminPath: '/admin/izin-saklama',
    retrievalApiPath: '/api/admin/kvkk-consents/{id}/evidence',
    evidenceFormat: 'KVKK_ONAY_KAYIT_BELGESI (yapılandırılmış kanıt)',
    slaHours: 4,
    ownerRole: 'super_admin',
  }),
];

let store: ConsentRetentionProcedure[] = SEED_CONSENT_PROCEDURES.map((row) => ({ ...row }));

export function cloneConsentProcedures(): ConsentRetentionProcedure[] {
  return store.map((row) => ({ ...row }));
}

export function replaceConsentProcedures(next: ConsentRetentionProcedure[]): void {
  store = next.map((row) => ({ ...row }));
}

export function createConsentProcedureId(): string {
  return `proc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resetConsentProcedures(): void {
  store = SEED_CONSENT_PROCEDURES.map((row) => ({ ...row }));
}
