import { LegalDocumentPage } from '@/features/authentication/components/legal-document-page';

export const metadata = {
  title: 'Gizlilik Politikası — Girisimco',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage title="Gizlilik Politikası">
      <p>
        Girisimco, kişisel verilerinizi gizlilik ilkelerine uygun şekilde korumayı amaçlar. Veriler
        yalnızca hizmet sunumu, güvenlik ve yasal yükümlülükler kapsamında işlenir.
      </p>
      <p>
        Üçüncü taraflarla paylaşım, yasal zorunluluklar veya açık rızanız olmadıkça yapılmaz.
      </p>
      <p>
        Bu metin bilgilendirme amaçlı bir taslaktır; nihai hukuki metin yayımlandığında burada
        güncellenecektir.
      </p>
    </LegalDocumentPage>
  );
}
