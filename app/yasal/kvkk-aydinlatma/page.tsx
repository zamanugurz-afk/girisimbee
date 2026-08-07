import { LegalDocumentPage } from '@/features/authentication/components/legal-document-page';

export const metadata = {
  title: 'KVKK Aydınlatma Metni — GirisimBee',
};

export default function KvkkClarificationPage() {
  return (
    <LegalDocumentPage title="KVKK Aydınlatma Metni">
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin işlenme
        amaçları, hukuki sebepleri ve haklarınız hakkında bilgilendirilirsiniz.
      </p>
      <p>
        Kayıt sırasında paylaştığınız ad, soyad, kullanıcı adı, telefon ve e-posta bilgileri hesap
        oluşturma, kimlik doğrulama ve platform hizmetlerinin sunulması amacıyla işlenir.
      </p>
      <p>
        Bu metin bilgilendirme amaçlı bir taslaktır; nihai hukuki metin yayımlandığında burada
        güncellenecektir.
      </p>
    </LegalDocumentPage>
  );
}
