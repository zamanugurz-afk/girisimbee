import { normalizeListingDescription } from '@/features/listings/lib/listing-content-quality';

export type FounderSummaryDraft = {
  shortDescription: string;
  longDescription: string;
};

export interface FounderSummaryContext {
  intent?: 'seeking' | 'joining';
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
  professionalSkillsOther?: string;
  technicalSkills?: string[] | string;
  technicalSkillsOther?: string;
  tools?: string[] | string;
  toolsOther?: string;
  city?: string | null;
  district?: string | null;
}

export function buildFounderSummaryDraft(ctx: FounderSummaryContext): FounderSummaryDraft {
  const isJoining = ctx.intent === 'joining';
  const title = ctx.title?.trim() || (isJoining ? 'Girişimci Profilim' : 'Girişimimiz');
  const sector = ctx.sector?.trim() || '';
  const stage = ctx.projectStage?.trim() || '';
  
  const rawPartners = Array.isArray(ctx.partnershipTypes)
    ? ctx.partnershipTypes
    : typeof ctx.partnershipType === 'string' && ctx.partnershipType.trim()
      ? ctx.partnershipType.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  const partnerType = rawPartners.length > 0 ? rawPartners.join(', ') : (ctx.partnershipType?.trim() || (isJoining ? 'Ortak' : 'Kurucu Ortak'));
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
      ...(ctx.professionalSkillsOther?.trim() ? [ctx.professionalSkillsOther.trim()] : []),
      ...(ctx.technicalSkillsOther?.trim() ? [ctx.technicalSkillsOther.trim()] : []),
    ])
  ).filter((e) => e !== 'Diğer' && e !== 'Diğer / Kendim gireceğim');

  const expertiseStr = allSkills.slice(0, 6).join(', ');
  const toolsList = Array.from(
    new Set([
      ...parseList(ctx.tools),
      ...(ctx.toolsOther?.trim() ? [ctx.toolsOther.trim()] : []),
    ])
  ).filter((t) => t !== 'Diğer' && t !== 'Diğer / Kendim gireceğim').slice(0, 5).join(', ');
  const location = [ctx.city, ctx.district].filter(Boolean).join(' / ');

  if (isJoining) {
    const stagePhrase = stage
      ? stage.toLocaleLowerCase('tr-TR').includes('aşama') || stage.toLocaleLowerCase('tr-TR').includes('asama')
        ? stage.toLocaleLowerCase('tr-TR') + ' olan girişimlere'
        : stage.toLocaleLowerCase('tr-TR') + ' aşamasındaki girişimlere'
      : 'büyüyen girişimlere';

    const shortParts = [
      sector ? sector + ' sektöründeki' : '',
      stagePhrase,
      expertiseStr ? expertiseStr + ' yetkinliklerimle' : '',
      partnerType.toLocaleLowerCase('tr-TR') + ' olarak katılmak ve değer katmak istiyorum',
    ].filter(Boolean);

    const shortDescription = normalizeListingDescription(shortParts.join(' ').trim() + '.');

    const longSentences: string[] = [];

    longSentences.push(
      (sector ? sector + ' sektöründe faaliyet gösteren veya geliştirilen' : 'Yenilikçi projeler yürüten') +
      (stage ? ', tercihen ' + stage.toLocaleLowerCase('tr-TR') + ' aşamasındaki' : '') +
      ' girişimlere ' + partnerType.toLocaleLowerCase('tr-TR') + ' olarak katılarak projenin büyümesine ve başarısına aktif katkı sağlamak istiyorum.'
    );

    if (expertiseStr) {
      longSentences.push(
        'Girişime doğrudan sorumluluk alarak değer katabileceğim başlıca yetkinlik ve uzmanlık alanlarım: ' + expertiseStr + '.'
      );
    }

    if (toolsList) {
      longSentences.push(
        'Aktif olarak kullandığım ve yetkin olduğum teknolojiler, araçlar ve ekipmanlar: ' + toolsList + '.'
      );
    }

    longSentences.push(
      'Çalışma modeli olarak ' + commitment.toLocaleLowerCase('tr-TR') + ' katılım sağlayabilecek durumdayım; hisse, rol dağılımı ve ortaklık şartları ilk görüşmede karşılıklı şeffaflıkla değerlendirilebilir.'
    );

    if (location) {
      longSentences.push(
        'Tercihen ' + location + ' lokasyonundaki veya düzenli uzaktan çalışma modeline sahip ekiplerle bir araya gelmek isterim.'
      );
    }

    longSentences.push(
      'Vizyoner kurucu ekiplerle tanışmaktan ve projenin mevcut durumu, ürün demosu, pazar doğrulaması ve yol haritası üzerine detaylı görüşmekten memnuniyet duyarım.'
    );

    const longDescription = normalizeListingDescription(longSentences.join(' '));

    return {
      shortDescription,
      longDescription,
    };
  }

  const stagePhrase = stage
    ? stage.toLocaleLowerCase('tr-TR').includes('aşama') || stage.toLocaleLowerCase('tr-TR').includes('asama')
      ? stage.toLocaleLowerCase('tr-TR') + ' olan projemiz için'
      : stage.toLocaleLowerCase('tr-TR') + ' aşamasındaki projemiz için'
    : 'büyüyen projemiz için';

  const shortParts = [
    sector ? sector + ' alanında' : '',
    stagePhrase,
    expertiseStr ? expertiseStr + ' konularında yetkin' : '',
    commitment.toLocaleLowerCase('tr-TR') + ' ' + partnerType.toLocaleLowerCase('tr-TR') + ' arıyoruz',
    equityStr ? '(' + equityStr + ' hisse payı ile)' : '',
  ].filter(Boolean);

  const shortDescription = normalizeListingDescription(shortParts.join(' ').trim() + '.');

  const longSentences: string[] = [];
  const stageLongPhrase = stage
    ? stage.toLocaleLowerCase('tr-TR').includes('aşama') || stage.toLocaleLowerCase('tr-TR').includes('asama')
      ? ' ' + stage.toLocaleLowerCase('tr-TR') + ' olarak'
      : ' ' + stage.toLocaleLowerCase('tr-TR') + ' aşamasında'
    : '';
  longSentences.push(
    title + ' projemiz' + (sector ? ', ' + sector + ' sektöründe' : '') + stageLongPhrase + ' faaliyet göstermektedir.'
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
