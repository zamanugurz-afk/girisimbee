import { LegalDocumentPage } from '@/features/authentication/components/legal-document-page';

export const metadata = {
  title: 'Kullanıcı Sözleşmesi — GirisimBee',
};

export default function TermsPage() {
  return (
    <LegalDocumentPage title="Kullanıcı Sözleşmesi">
      <p>
        Bu sözleşme, GirisimBee platformuna üye olurken kabul ettiğiniz kullanım koşullarını
        özetler. Platformu kullanarak hizmet şartlarına uyacağınızı kabul etmiş olursunuz.
      </p>
      <p>
        Hesap bilgilerinizin doğruluğundan ve güvenliğinden siz sorumlusunuz. Platformu yasa dışı
        amaçlarla kullanamazsınız.
      </p>
      <p>
        Bu metin bilgilendirme amaçlı bir taslaktır; nihai hukuki metin yayımlandığında burada
        güncellenecektir.
      </p>
    </LegalDocumentPage>
  );
}
