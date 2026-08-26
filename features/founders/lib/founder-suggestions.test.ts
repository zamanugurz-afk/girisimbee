import { describe, it, expect } from 'vitest';
import { resolveFounderSuggestions } from './founder-suggestions';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';

describe('Founder Smart Multi-Dimensional Matching Engine', () => {
  it('correctly matches ClimateTech + First Customers + Agency Partner', () => {
    const result = resolveFounderSuggestions({
      sector: 'İklim teknolojisi',
      stage: 'İlk müşteriler',
      targetPartnerType: 'Acentelik ve Temsilcilik Ortağı',
    });

    expect(result.partnershipTypes).toContain('Acentelik ve Temsilcilik Ortağı');
    expect(result.partnershipTypes).toContain('Satış ve B2B İş Geliştirme Ortağı');
    expect(result.partnershipTypes).toContain(MANUAL_OPTION);

    expect(result.professionalSkills).toContain('Acentelik, Bayilik ve Distribütör Ağı Yönetimi');
    expect(result.professionalSkills).toContain('ESG, Karbon Ayak İzi ve Sürdürülebilirlik Yönetimi');
    expect(result.professionalSkills).toContain('Pilot Proje (PoC) ve İlk Referans Müşteri Yönetimi');

    expect(result.technicalSkills).toContain('Karbon Ayak İzi Hesaplama ve Sera Gazı Doğrulama (GHG Protocol)');
    expect(result.technicalSkills).toContain('Yenilenebilir Enerji ve Enerji Verimliliği Sistemleri');

    expect(result.tools).toContain('Karbon Muhasebesi ve ESG Raporlama Yazılımları');
    expect(result.tools).toContain('HubSpot / Salesforce / Zoho CRM');
  });

  it('correctly matches HealthTech + MVP + Management Partner', () => {
    const result = resolveFounderSuggestions({
      sector: 'Sağlık teknolojisi',
      stage: 'MVP aşaması',
      targetPartnerType: 'Yönetim Ortağı',
    });

    expect(result.partnershipTypes).toContain('Yönetim Ortağı');
    expect(result.partnershipTypes).toContain('Biyoteknoloji ve Sağlık Teknolojisi Ortağı');

    expect(result.professionalSkills).toContain('Sağlık Sektörü ve Klinik Süreç Yönetimi');
    expect(result.professionalSkills).toContain('Medikal Regülasyon ve CE / FDA / Sağlık Bakanlığı Onayları');

    expect(result.technicalSkills).toContain('Sağlık Bilişimi ve HL7 / FHIR Entegrasyonu');
    expect(result.tools).toContain('AWS HealthLake / GCP Healthcare');
  });

  it('correctly matches AgriTech + Idea + Investor Partner', () => {
    const result = resolveFounderSuggestions({
      sector: 'Tarım teknolojisi',
      stage: 'Fikir aşaması',
      targetPartnerType: 'Melek Yatırımcı (Angel Investor)',
    });

    expect(result.partnershipTypes).toContain('Melek Yatırımcı (Angel Investor)');
    expect(result.partnershipTypes).toContain('Tarım Arazisi ve Sera Alanı Sağlayıcı Ortak');

    expect(result.professionalSkills).toContain('Tarımsal Operasyon ve Sera Yönetimi');
    expect(result.technicalSkills).toContain('Tarımsal IoT Sensörleri ve Otomasyon Sistemleri');
  });
});
