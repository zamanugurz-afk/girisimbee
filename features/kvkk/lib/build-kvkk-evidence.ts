import type {
  KvkkConsentEvidenceDocument,
  KvkkConsentRecord,
} from '@/features/kvkk/types/kvkk-consent.types';

export function buildKvkkConsentEvidence(
  record: KvkkConsentRecord,
): KvkkConsentEvidenceDocument {
  const consentedAt = record.consentedAt;
  const ipPart = record.ipAddress ? ` IP: ${record.ipAddress}.` : '';
  const uaPart = record.userAgent ? ` Kullanıcı aracısı kaydedildi.` : '';

  return {
    documentType: 'KVKK_ONAY_KAYIT_BELGESI',
    documentTitle: 'KVKK Açık Rıza / Onay Kayıt Belgesi',
    generatedAt: new Date().toISOString(),
    recordId: record.id,
    consentedAt,
    consentVersion: record.consentVersion,
    source: record.source,
    subject: {
      userId: record.userId,
      profileId: record.profileId,
    },
    listingId: record.listingId,
    client: {
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
    },
    items: record.consentItems,
    consents: record.consents,
    attestation:
      `Bu belge, kayıt kimliği ${record.id} olan kullanıcının ` +
      `${consentedAt} tarihinde (politika sürümü ${record.consentVersion}) ` +
      `aşağıdaki KVKK onaylarını verdiğini gösterir.${ipPart}${uaPart} ` +
      `Kayıt değiştirilemez (append-only) audit defterinde saklanmaktadır.`,
  };
}
