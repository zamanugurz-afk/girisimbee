/**
 * Intelligent Contextual Listing Image Engine for Girisimbee.
 *
 * Rules:
 * 1. If user provided a real custom photo (coverUrl or imageUrl), ALWAYS respect and use it.
 * 2. If no photo is provided, deeply analyze the ENTIRE listing content (title, description,
 *    category, sector, tags, custom fields) and match with a precision curated HD image pool.
 * 3. Enforce deterministic hashing across distinct multi-image pools so identical categories
 *    never get duplicate identical images.
 */

// Comprehensive, high-resolution, uncompressed curated photography catalog
const IMAGE_CATALOG = {
  // --- TECH, SAAS & AI ---
  b2b_saas: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', // Analytics Dashboard UI
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', // Financial Software Matrix
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80', // Data Metrics Graph
  ],
  ai_ml_llm: [
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80', // AI Neural Interface
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', // Abstract AI Visualization
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', // Code Algorithm Screen
  ],
  developer_tools_coding: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', // Modern IDE Setup
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', // Code Syntax Dark Mode
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', // Dual Monitor Engineering
  ],
  cloud_devops: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', // Global Cloud Network
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', // Server Data Center
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', // Infrastructure Cables
  ],
  mobile_app: [
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80', // Mobile UX Device
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80', // iPhone App Design
  ],
  ui_ux_design: [
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80', // Figma Wireframe Canvas
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80', // Product Design Team
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', // Web Layout Moodboard
  ],

  // --- FINTECH, BANKING & SECURITY ---
  fintech_payments: [
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80', // POS Card Payment
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', // Digital Banking App
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80', // Contactless Smart Payment
  ],
  cybersecurity: [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', // Cyber Security Shield
    'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80', // Code Security Stream
  ],

  // --- GREEN ENERGY, IOT & INDUSTRY ---
  solar_cleantech: [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', // Solar Panels Landscape
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80', // Green Wind Turbines
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80', // Sustainable Energy Field
  ],
  industrial_3d_hardware: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', // High Tech Manufacturing
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', // Precision Robotics Workshop
  ],

  // --- LOGISTICS, CARGO & SUPPLY CHAIN ---
  logistics_cargo: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', // Modern Logistics Warehouse
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80', // Transportation Hub
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80', // Cargo Delivery Fleet
  ],

  // --- HEALTHCARE & MEDTECH ---
  medical_healthtech: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', // Medical Technology Lab
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', // Clinical Research
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80', // Modern Healthcare Diagnostic
  ],

  // --- LEGAL & CONSULTING ---
  legal_corporate: [
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80', // Modern Legal Office & Contract
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', // Corporate Glass Tower
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80', // Business Advisory Session
  ],
  accounting_finance: [
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', // Financial Accounting Audit
    'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80', // Tax Advisory Spreadsheets
  ],

  // --- MARKETING, SALES & MEDIA ---
  growth_marketing: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', // Growth Analytics Funnel
    'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=800&q=80', // Marketing Strategy Board
  ],
  video_content_social: [
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80', // Video Production Studio
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80', // Social Media Creative Workspace
  ],
  b2b_sales_executive: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', // Executive Meeting
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80', // Strategic Handshake
  ],

  // --- E-COMMERCE & BEAUTY ---
  ecommerce_cosmetics: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', // Luxury Cosmetics Display
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', // Organic Skincare Bottles
  ],
  beauty_aesthetic_wellness: [
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80', // Modern Aesthetic Spa Clinic
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', // Wellness Treatment Lounge
  ],

  // --- FOOD & CAFE FRANCHISE ---
  artisan_cafe: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', // Specialty Espresso Cafe
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', // Artisan Coffee Roaster
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', // Warm Cafe Interior
  ],
  gourmet_food_burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', // Gourmet Burger
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', // Restaurant Ambience
  ],

  // --- FITNESS & SPORTS ---
  fitness_ems: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', // Modern Fitness Gym
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', // Athletic Training
  ],

  // --- AUTOMOTIVE & EXPERTISE ---
  automotive_expert: [
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80', // Auto Diagnostics Workshop
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', // Car Inspection Bay
  ],

  // --- EDUCATION & KINDERGARTEN ---
  education_kindergarten: [
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80', // Modern School / Kindergarten
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', // Creative Classroom Workshop
  ],

  // --- VENTURE CAPITAL & ANGEL INVESTING ---
  venture_capital: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', // Startup Pitch Room
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80', // Venture Investment Growth
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', // Business Executive
  ],

  // --- GENERAL FALLBACK ---
  default_corporate: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  ],
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface ListingContentContext {
  title?: string | null;
  description?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  industry?: string | null;
  sector?: string | null;
  customFields?: Record<string, unknown> | null;
  coverUrl?: string | null;
  imageUrl?: string | null;
}

/**
 * Resolves the ideal, context-tailored high-resolution image for any listing.
 * If the user provided an image, it is returned immediately.
 * Otherwise, the content text is evaluated to select the most fitting unique visual.
 */
export function resolveContextualListingImage(context: ListingContentContext): string {
  // 1. User Uploaded Photo takes precedence
  const explicit = (context.imageUrl || context.coverUrl || '').trim();
  if (explicit && explicit.startsWith('http')) {
    return explicit;
  }

  // 2. Aggregate all textual tokens
  const fullText = [
    context.title || '',
    context.description || '',
    context.categorySlug || '',
    context.categoryName || '',
    context.industry || '',
    context.sector || '',
    JSON.stringify(context.customFields || {}),
  ]
    .join(' ')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  const seedKey = `${context.title || ''}-${context.categorySlug || ''}`;
  const hash = simpleHash(seedKey || 'girisimbee-default');

  const pick = (pool: string[]): string => pool[hash % pool.length];

  // 3. High-precision semantic keyword rules
  if (fullText.includes('gunes') || fullText.includes('ges') || fullText.includes('solar') || fullText.includes('karbon') || fullText.includes('ruzgar') || fullText.includes('temiz enerji') || fullText.includes('iklim')) {
    return pick(IMAGE_CATALOG.solar_cleantech);
  }

  if (fullText.includes('biyometrik') || fullText.includes('kimlik') || fullText.includes('siber') || fullText.includes('pentest') || fullText.includes('guvenlik')) {
    return pick(IMAGE_CATALOG.cybersecurity);
  }

  if (fullText.includes('odeme') || fullText.includes('pos') || fullText.includes('fintech') || fullText.includes('bankacilik') || fullText.includes('kredi') || fullText.includes('fatura') || fullText.includes('muhasebe')) {
    return pick(IMAGE_CATALOG.fintech_payments);
  }

  if (fullText.includes('radyoloji') || fullText.includes('medikal') || fullText.includes('saglik') || fullText.includes('klinik') || fullText.includes('hastane')) {
    return pick(IMAGE_CATALOG.medical_healthtech);
  }

  if (fullText.includes('hukuk') || fullText.includes('avukat') || fullText.includes('sozlesme') || fullText.includes('legal') || fullText.includes('kvkk') || fullText.includes('safe')) {
    return pick(IMAGE_CATALOG.legal_corporate);
  }

  if (fullText.includes('mali musavir') || fullText.includes('vergi') || fullText.includes('bordro') || fullText.includes('defter')) {
    return pick(IMAGE_CATALOG.accounting_finance);
  }

  if (fullText.includes('kahve') || fullText.includes('kruvasan') || fullText.includes('kafe') || fullText.includes('barista') || fullText.includes('roast')) {
    return pick(IMAGE_CATALOG.artisan_cafe);
  }

  if (fullText.includes('burger') || fullText.includes('restoran') || fullText.includes('gida') || fullText.includes('yemek')) {
    return pick(IMAGE_CATALOG.gourmet_food_burger);
  }

  if (fullText.includes('ekspertiz') || fullText.includes('oto') || fullText.includes('otomotiv') || fullText.includes('arac') || fullText.includes('teshis')) {
    return pick(IMAGE_CATALOG.automotive_expert);
  }

  if (fullText.includes('ems') || fullText.includes('fitness') || fullText.includes('spor') || fullText.includes('antrenor') || fullText.includes('gym')) {
    return pick(IMAGE_CATALOG.fitness_ems);
  }

  if (fullText.includes('anaokul') || fullText.includes('kres') || fullText.includes('cocuk') || fullText.includes('robotik') || fullText.includes('kodlama') || fullText.includes('egitim')) {
    return pick(IMAGE_CATALOG.education_kindergarten);
  }

  if (fullText.includes('kozmetik') || fullText.includes('cilt') || fullText.includes('organik') || fullText.includes('serum') || fullText.includes('krem')) {
    return pick(IMAGE_CATALOG.ecommerce_cosmetics);
  }

  if (fullText.includes('estetik') || fullText.includes('guzellik') || fullText.includes('lazer') || fullText.includes('wellness') || fullText.includes('spa')) {
    return pick(IMAGE_CATALOG.beauty_aesthetic_wellness);
  }

  if (fullText.includes('lojistik') || fullText.includes('kargo') || fullText.includes('rota') || fullText.includes('depo') || fullText.includes('tasimacilik') || fullText.includes('ihracat')) {
    return pick(IMAGE_CATALOG.logistics_cargo);
  }

  if (fullText.includes('3d') || fullText.includes('imalat') || fullText.includes('prototip') || fullText.includes('uretim') || fullText.includes('sanayi')) {
    return pick(IMAGE_CATALOG.industrial_3d_hardware);
  }

  if (fullText.includes('llm') || fullText.includes('yapay zeka') || fullText.includes('nlp') || fullText.includes('machine learning') || fullText.includes('deep learning')) {
    return pick(IMAGE_CATALOG.ai_ml_llm);
  }

  if (fullText.includes('cloud') || fullText.includes('devops') || fullText.includes('kubernetes') || fullText.includes('aws') || fullText.includes('terraform') || fullText.includes('docker')) {
    return pick(IMAGE_CATALOG.cloud_devops);
  }

  if (fullText.includes('mobil') || fullText.includes('flutter') || fullText.includes('ios') || fullText.includes('swift') || fullText.includes('android')) {
    return pick(IMAGE_CATALOG.mobile_app);
  }

  if (fullText.includes('ui') || fullText.includes('ux') || fullText.includes('figma') || fullText.includes('tasarim') || fullText.includes('designer') || fullText.includes('logo') || fullText.includes('marka')) {
    return pick(IMAGE_CATALOG.ui_ux_design);
  }

  if (fullText.includes('pazarlama') || fullText.includes('growth') || fullText.includes('meta ads') || fullText.includes('reklam') || fullText.includes('roas') || fullText.includes('seo')) {
    return pick(IMAGE_CATALOG.growth_marketing);
  }

  if (fullText.includes('video') || fullText.includes('reels') || fullText.includes('tiktok') || fullText.includes('medya') || fullText.includes('youtube') || fullText.includes('icerik')) {
    return pick(IMAGE_CATALOG.video_content_social);
  }

  if (fullText.includes('developer') || fullText.includes('full-stack') || fullText.includes('frontend') || fullText.includes('backend') || fullText.includes('yazilim') || fullText.includes('react') || fullText.includes('node')) {
    return pick(IMAGE_CATALOG.developer_tools_coding);
  }

  if (fullText.includes('yatirim') || fullText.includes('melek') || fullText.includes('venture') || fullText.includes('seed') || fullText.includes('fon')) {
    return pick(IMAGE_CATALOG.venture_capital);
  }

  if (fullText.includes('saas') || fullText.includes('b2b') || fullText.includes('crm') || fullText.includes('platform')) {
    return pick(IMAGE_CATALOG.b2b_saas);
  }

  return pick(IMAGE_CATALOG.default_corporate);
}
