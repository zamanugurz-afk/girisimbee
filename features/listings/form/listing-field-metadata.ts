/** UI metadata for listing form fields — helpers, placeholders, limits, tooltips. */
export interface FieldUiMeta {
  helperText?: string;
  placeholder?: string;
  maxLength?: number;
}

export const CORE_FIELD_UI: Record<string, FieldUiMeta> = {
  title: {
    placeholder: 'Örn. Fintech SaaS platformu — Seri A yatırım turu',
    helperText: 'Net ve dikkat çekici bir başlık ilanınızın keşfedilmesini kolaylaştırır.',
    maxLength: 200,
  },
  shortDescription: {
    placeholder: 'Girişiminizi, rolünüzü veya aradığınız fırsatı 2-3 cümlede özetleyin…',
    helperText: 'Arama sonuçlarında görünür. En az 30 karakter yazın.',
    maxLength: 500,
  },
  longDescription: {
    placeholder: 'Detaylı açıklama, vizyon, beklentiler ve ek bilgiler…',
    helperText: 'İlan detay sayfasında gösterilir. En az 100 karakter yazın.',
    maxLength: 10000,
  },
  city: {
    placeholder: 'Şehir seçin',
    helperText: 'Faaliyet gösterdiğiniz veya ilanla ilişkili şehir.',
  },
  remotePolicy: {
    placeholder: 'Çalışma modeli seçin',
    helperText: 'Ofis, hibrit veya tam uzaktan çalışma tercihiniz.',
  },
};

export const CUSTOM_FIELD_UI: Record<string, FieldUiMeta> = {
  investmentAmount: {
    placeholder: 'Yatırım tutarı aralığı seçin',
    helperText: 'Ayırmayı planladığınız veya aradığınız yatırım miktarını belirtin.',
  },
  equityOffered: {
    placeholder: 'Örn. 10',
    helperText: 'Yatırımcılara sunmayı planladığınız hisse oranı (%).',
  },
  stage: {
    placeholder: 'Girişim aşaması seçin',
    helperText: 'Mevcut gelişim seviyeniz yatırımcı eşleşmesini iyileştirir.',
  },
  minInvestment: {
    placeholder: 'Minimum katkı aralığı seçin',
    helperText: 'Tek bir yatırımcıdan kabul edeceğiniz minimum tutar.',
  },
  maxInvestment: {
    placeholder: 'Maksimum katkı aralığı seçin',
    helperText: 'Tek bir yatırımcıdan kabul edeceğiniz maksimum tutar.',
  },
  useOfFunds: {
    helperText: 'Yatırımın kullanılacağı alanları seçin. Birden fazla seçebilirsiniz.',
  },
  currency: {
    placeholder: 'Para birimi seçin',
    helperText: 'Tutarların gösterileceği para birimi.',
  },
  ticketSizeMin: {
    placeholder: 'Minimum bilet aralığı seçin',
    helperText: 'Tek bir yatırımda ayırmayı planladığınız minimum tutar.',
  },
  ticketSizeMax: {
    placeholder: 'Maksimum bilet aralığı seçin',
    helperText: 'Tek bir yatırımda ayırmayı planladığınız maksimum tutar.',
  },
  preferredStages: {
    placeholder: 'Tercih edilen aşama seçin',
    helperText: 'Yatırım yapmayı tercih ettiğiniz girişim aşamaları.',
  },
  sectors: {
    placeholder: 'Örn. Fintech, SaaS, E-ticaret, Yapay Zeka…',
    helperText: 'İlgilendiğiniz sektörleri virgülle ayırarak yazın.',
    maxLength: 500,
  },
  investmentFocus: {
    placeholder: 'Örn. B2B SaaS, erken aşama, Türkiye odaklı…',
    helperText: 'Yatırım stratejinizi ve odağınızı kısaca tanımlayın.',
    maxLength: 500,
  },
  desiredRole: {
    placeholder: 'Pozisyon seçin',
    helperText: 'Aradığınız veya hedeflediğiniz pozisyon.',
  },
  experienceLevel: {
    placeholder: 'Deneyim seviyesi seçin',
    helperText: 'İlgili alandaki deneyim seviyeniz.',
  },
  salaryRange: {
    placeholder: 'Maaş aralığı seçin',
    helperText: 'Sunmayı planladığınız maaş aralığı.',
  },
  expertise: {
    helperText: 'Aradığınız ortağın uzmanlık alanlarını seçin.',
  },
  salaryExpectation: {
    placeholder: 'Maaş beklentisi aralığı seçin',
    helperText: 'Net veya brüt maaş beklentinizi aralık olarak belirtin.',
  },
  workType: {
    placeholder: 'Çalışma tipi seçin',
    helperText: 'Tam zamanlı, yarı zamanlı veya proje bazlı tercihiniz.',
  },
  remotePreference: {
    placeholder: 'Uzaktan çalışma tercihi seçin',
    helperText: 'Ofis, hibrit veya tam uzaktan çalışma tercihiniz.',
  },
  positionTitle: {
    placeholder: 'Pozisyon seçin',
    helperText: 'Açtığınız pozisyonu listeden seçin.',
  },
  partnershipType: {
    placeholder: 'Ortaklık tipi seçin',
    helperText: 'Aradığınız ortaklık türünü seçin.',
  },
  commitment: {
    placeholder: 'Taahhüt seviyesi seçin',
    helperText: 'Ortaktan beklediğiniz zaman taahhüdü.',
  },
  projectStage: {
    placeholder: 'Proje aşaması seçin',
    helperText: 'Projenizin mevcut gelişim aşaması.',
  },
};

export const META_FIELD_UI: Record<string, FieldUiMeta> = {
  tags: {
    helperText: 'Kategorinize uygun etiketleri seçin. En fazla 10 etiket.',
  },
  images: {
    helperText: 'Sürükleyerek sıralayın. İlk görsel kapak olarak kullanılır. En fazla 10 görsel.',
  },
};

export function getCoreFieldUi(key: string): FieldUiMeta {
  return CORE_FIELD_UI[key] ?? {};
}

export function getCustomFieldUi(key: string): FieldUiMeta {
  return CUSTOM_FIELD_UI[key] ?? {};
}
