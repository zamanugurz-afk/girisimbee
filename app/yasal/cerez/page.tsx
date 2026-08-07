import { LegalDocumentPage } from '@/features/authentication/components/legal-document-page';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';

export const metadata = {
  title: 'Çerez Politikası — Girisimbee',
};

export default function CookiePolicyPage() {
  return (
    <LegalDocumentPage title="Çerez Politikası">
      <p>
        <BrandWordmark />, oturum yönetimi, güvenlik ve temel site işlevleri için gerekli çerezleri
        kullanabilir. Tercih ve analitik çerezler, izin verdiğiniz ölçüde kullanılabilir.
      </p>
      <p>
        Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz; bazı çerezler kapatıldığında site
        işlevleri kısıtlanabilir.
      </p>
      <p>
        Bu metin bilgilendirme amaçlı bir taslaktır; nihai hukuki metin yayımlandığında burada
        güncellenecektir.
      </p>
    </LegalDocumentPage>
  );
}
