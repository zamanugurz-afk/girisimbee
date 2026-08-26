import { normalizeListingDescription } from '@/features/listings/lib/listing-content-quality';

export type FounderSummaryDraft = {
  shortDescription: string;
  longDescription: string;
};

export interface FounderSummaryContext {
  title?: string;
  sector?: string;
  projectStage?: string;
  partnershipType?: string;
  partnershipTypes?: string[] | string;
  commitment?: string;
  equityOffered?: number | string;
  expertise?: string[] | string;
  expertiseOther?: string;
  professionalSkills?: string[] | string;
  technicalSkills?: string[] | string;
  tools?: string[] | string;
  city?: string | null;
  district?: string | null;
}

export function buildFounderSummaryDraft(ctx: FounderSummaryContext): FounderSummaryDraft {
  const title = ctx.title?.trim() || 'Girişimimiz';
  const sector = ctx.sector?.trim() || '';
  const stage = ctx.projectStage?.trim() || '';
  
  const rawPartners = Array.isArray(ctx.partnershipTypes)
    ? ctx.partnershipTypes
    : typeof ctx.partnershipType === 'string' && ctx.partnershipType.trim()
      ? ctx.partnershipType.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  const partnerType = rawPartners.length > 0 ? rawPartners.join(', ') : (ctx.partnershipType?.trim() || 'Kurucu Ortak');
  const commitment = ctx.commitment?.trim() || 'Tam zamanlı';
  const equityNum =
    typeof ctx.equityOffered === 'number'
      ? ctx.equityOffered
      : typeof ctx.equityOffered === 'string' && ctx.equityOffered.trim()
        ? parseFloat(ctx.equityOffered.replace('%', '').trim())
        : null;
  const equityStr = equityNum !== null && !isNaN(equityNum) && equityNum > 0 ? '%' + equityNum : '';

  const parseList = (val?: string[] | string) =>
    Array.isArray(val) ? val : typeof val === 'string' && val.trim() ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const allSkills = Array.from(
    new Set([
      ...parseList(ctx.expertise),
      ...parseList(ctx.professionalSkills),
      ...parseList(ctx.technicalSkills),
      ...(ctx.expertiseOther?.trim() ? [ctx.expertiseOther.trim()] : []),
    ])
  ).filter((e) => e !== 'Diğer' && e !== 'Diğer / Kendim gireceğim');

  const expertiseStr = allSkills.slice(0, 6).join(', ');
  const toolsList = parseList(ctx.tools).slice(0, 5).join(', ');
  const location = [ctx.city, ctx.district].filter(Boolean).join(' / ');

  const shortParts = [
    sector ? sector + ' alanında' : '',
    stage ? stage.toLocaleLowerCase('tr-TR') + ' olan projemiz için' : 'büyüyen projemiz için',
    expertiseStr ? expertiseStr + ' konularında yetkin' : '',
    commitment.toLocaleLowerCase('tr-TR') + ' ' + partnerType.toLocaleLowerCase('tr-TR') + ' arıyoruz',
    equityStr ? '(' + equityStr + ' hisse payı ile)' : '',
  ].filter(Boolean);

  const shortDescription = normalizeListingDescription(shortParts.join(' ').trim() + '.');

  const longSentences: string[] = [];
  longSentences.push(
    title + ' projemiz' + (sector ? ', ' + sector + ' sektöründe' : '') + (stage ? ' ' + stage.toLocaleLowerCase('tr-TR') + ' olarak' : '') + ' faaliyet göstermektedir.'
  );

  if (expertiseStr) {
    longSentences.push(
      'Ekibimize değer katacak, özellikle ' + expertiseStr + ' alanlarında sorumluluk alabilecek bir ' + partnerType.toLocaleLowerCase('tr-TR') + ' arayışındayız.'
    );
  } else {
    longSentences.push(
      'Ekibimize vizyonuyla değer katacak ve sorumluluk alabilecek bir ' + partnerType.toLocaleLowerCase('tr-TR') + ' arayışındayız.'
    );
  }

  longSentences.push(
    'Çalışma modeli olarak ' + commitment.toLocaleLowerCase('tr-TR') + ' katılım beklenmekte olup' +
    (equityStr
      ? ', karşılığında ' + equityStr + ' hisse (equity) ortaklığı sunulmaktadır.'
      : '; hisse ve ortaklık detayları ilk görüşmede karşılıklı belirlenecektir.')
  );

  if (toolsList) {
    longSentences.push(
      'Girişimimizde aktif olarak kullanılan veya hakimiyeti tercih edilen teknolojiler / araçlar: ' + toolsList + '.'
    );
  }

  if (location) {
    longSentences.push(
      'Tercihen ' + location + ' lokasyonunda veya düzenli uzaktan iletişim disiplinine sahip ortaklar ile görüşmek istiyoruz.'
    );
  }

  longSentences.push(
    'İlgilenen adaylarla ürün demosu, mevcut pazar doğrulaması ve yol haritası ilk görüşmede şeffaflıkla paylaşılacaktır.'
  );

  const longDescription = normalizeListingDescription(longSentences.join(' '));

  return {
    shortDescription,
    longDescription,
  };
}
