import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import type { LegalDocumentBody } from '@/features/legal/lib/legal-document.utils';

/** Purpose-based explicit consents (not a blanket consent). */
export function buildExplicitConsentHubDocument(): LegalDocumentBody {
  return {
    meta: LEGAL_DOCUMENT_VERSIONS.explicit_consent_phone,
    intro:
      'Bu sayfa, {{tradeName}} Platformu’nda yalnızca açık rıza gerektiren belirli amaçlara ilişkin metinleri içerir. Aydınlatma Metni bilgilendirmedir; aşağıdaki rızalar ondan ayrıdır ve geri çekilebilir.',
    sections: [
      {
        id: 'phone',
        title: 'A) Telefon numarasının ilanda gösterilmesi',
        paragraphs: [
          `Versiyon: ${LEGAL_DOCUMENT_VERSIONS.explicit_consent_phone.version}`,
          'Açık rıza vermeniz halinde doğrulanmış telefon numaranız ilgili ilanda iletişim amacıyla görüntülenebilir ve diğer kullanıcılar sizi arayabilir.',
          'Rızanızı hesap ayarlarındaki izinler bölümünden geri çekebilirsiniz; geri çekme, geri alma anından sonraki görünürlüğü etkiler.',
        ],
      },
      {
        id: 'cv',
        title: 'B) CV / belgelerin ilan sahibi ile paylaşılması',
        paragraphs: [
          `Versiyon: ${LEGAL_DOCUMENT_VERSIONS.explicit_consent_cv.version}`,
          'İş arayan süreçlerinde CV ve yüklediğiniz belgeler; özgeçmişinizin ilgili ilan sahipleri tarafından görüntülenmesi amacıyla işlenebilir / paylaşılabilir.',
          'CV içinde özel nitelikli kişisel veri (sağlık, inanç, sendika vb.) paylaşmamanız önerilir. Paylaşırsanız bu verilerin işlenmesi riskini kabul etmiş olursunuz; Platform bunları kasıtlı olarak talep etmez.',
        ],
      },
      {
        id: 'third-party',
        title: 'C) Üçüncü taraf / hizmet sağlayıcı paylaşımı (iş arayan)',
        paragraphs: [
          `Versiyon: ${LEGAL_DOCUMENT_VERSIONS.explicit_consent_third_party.version}`,
          'İş arayan yayınında ayrıca onayladığınız takdirde, belirtilen amaçlarla hizmetin yürütülmesi için gerekli üçüncü taraflarla sınırlı paylaşım yapılabilir. Genel / belirsiz rıza istenmez.',
        ],
      },
      {
        id: 'employer',
        title: 'D) İşveren / ilgili işverenlerle paylaşım',
        paragraphs: [
          `Versiyon: ${LEGAL_DOCUMENT_VERSIONS.explicit_consent_employer.version}`,
          'Onay vermeniz halinde profil ve CV bilgileriniz ilgili iş ilanı / işveren bağlamında paylaşılabilir.',
        ],
      },
      {
        id: 'marketing',
        title: 'E) Ticari elektronik ileti (ayrı izin)',
        paragraphs: [
          'Pazarlama / bilgilendirme SMS veya e-postası yalnızca ayrıca verdiğiniz izinlerle ve İYS / mevzuat uygunluğu sağlandığında gönderilir. İşlemsel e-postalar (doğrulama, güvenlik) bu izne bağlı değildir.',
        ],
      },
      {
        id: 'withdrawal',
        title: 'Rızanın geri alınması',
        paragraphs: [
          'Açık rızalarınızı “İzinler ve Gizlilik Tercihleri” üzerinden geri çekebilirsiniz. Geri alma, geri almadan önce hukuka uygun yapılmış işlemleri geçmişe etkili olarak geçersiz kılmaz.',
        ],
      },
    ],
  };
}
