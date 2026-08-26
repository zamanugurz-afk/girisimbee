import { describe, it, expect } from 'vitest';
import { buildFounderSummaryDraft } from './founder-summary';

describe('buildFounderSummaryDraft', () => {
  it('generates seeking intent draft correctly (Ortak Arıyorum)', () => {
    const draft = buildFounderSummaryDraft({
      intent: 'seeking',
      title: 'Bilişim Yazılım AI Projesi',
      sector: 'Bilişim / Yazılım',
      projectStage: 'MVP / Prototip',
      partnershipTypes: ['Teknik Ortak (CTO)'],
      commitment: 'Tam zamanlı',
      equityOffered: '15',
      technicalSkills: ['Full-Stack Web Geliştirme (Next.js / Node.js)', 'Yapay Zeka, LLM ve Model Eğitimi'],
      tools: ['Next.js / React', 'Amazon Web Services (AWS)'],
      city: 'İstanbul',
    });

    expect(draft.shortDescription).toContain('Bilişim / Yazılım alanında');
    expect(draft.shortDescription).toContain('teknik ortak (CTO) arıyoruz');
    expect(draft.shortDescription).toContain('%15');

    expect(draft.longDescription).toContain('Bilişim Yazılım AI Projesi projemiz');
    expect(draft.longDescription).toContain('faaliyet göstermektedir');
    expect(draft.longDescription).toContain('Ekibimize değer katacak');
    expect(draft.longDescription).toContain('teknik ortak (CTO) arayışındayız');
  });

  it('generates joining intent draft correctly (Ortak Olmak İstiyorum)', () => {
    const draft = buildFounderSummaryDraft({
      intent: 'joining',
      sector: 'Bilişim / Yazılım',
      projectStage: 'MVP / Prototip',
      partnershipTypes: ['Teknik Ortak (CTO)'],
      commitment: 'Tam zamanlı',
      technicalSkills: ['Full-Stack Web Geliştirme (Next.js / Node.js)', 'Yapay Zeka, LLM ve Model Eğitimi'],
      tools: ['Amazon Web Services (AWS)'],
      city: 'İstanbul',
    });

    expect(draft.shortDescription).toContain('Bilişim / Yazılım sektöründeki');
    expect(draft.shortDescription).toContain('teknik ortak (CTO) olarak katılmak ve değer katmak istiyorum');

    expect(draft.longDescription).toContain('Bilişim / Yazılım sektöründe faaliyet gösteren veya geliştirilen');
    expect(draft.longDescription).toContain('girişimlere teknik ortak (CTO) olarak katılarak projenin büyümesine ve başarısına aktif katkı sağlamak istiyorum');
    expect(draft.longDescription).toContain('Girişime doğrudan sorumluluk alarak değer katabileceğim başlıca yetkinlik ve uzmanlık alanlarım');
    expect(draft.longDescription).toContain('Amazon Web Services (AWS)');
    expect(draft.longDescription).toContain('Vizyoner kurucu ekiplerle tanışmaktan');
    expect(draft.longDescription).not.toContain('arayışındayız');
    expect(draft.longDescription).not.toContain('Ekibimize değer katacak');
  });
});
