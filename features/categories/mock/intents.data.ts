export type {
  CategoryIntentId,
  CategoryIntent,
  CategorySection,
  ContentItem,
  ContentType,
  IntentId,
  IntentConfig,
  IntentSection,
} from '@/features/categories/types/category.types';

export const INTENTS: import('@/features/categories/types/category.types').CategoryIntent[] = [
  {
    id: 'find-investment',
    label: 'Yatırım Bul',
    shortLabel: 'Yatırım',
    description: 'Projeniz için doğru yatırımcıyı keşfedin.',
    accent: '#22C55E',
    accentMuted: 'bg-[#22C55E]/8 text-[#16A34A]',
    sections: [
      {
        id: 'latest-investors',
        title: 'Son Yatırımcılar',
        items: [
          { id: 'fi-1', type: 'person', title: 'Elif Kaya', subtitle: 'Melek Yatırımcı', detail: '500K–2M TL arası', location: 'İstanbul', tag: 'SaaS', timeAgo: '12 dk', initials: 'EK' },
          { id: 'fi-2', type: 'person', title: 'Marcus Chen', subtitle: 'VC Partner', detail: 'Seed & Series A', location: 'İstanbul', tag: 'Fintech', timeAgo: '28 dk', initials: 'MC' },
          { id: 'fi-3', type: 'person', title: 'Deniz Arslan', subtitle: 'Angel Investor', detail: 'Erken aşama odaklı', location: 'Ankara', tag: 'HealthTech', timeAgo: '1 sa', initials: 'DA' },
          { id: 'fi-4', type: 'person', title: 'Selin Yıldız', subtitle: 'Family Office', detail: '1M–10M TL', location: 'İzmir', tag: 'E-ticaret', timeAgo: '2 sa', initials: 'SY' },
        ],
      },
      {
        id: 'featured-investors',
        title: 'Öne Çıkan Yatırımcılar',
        items: [
          { id: 'fi-5', type: 'person', title: 'Kerem Öztürk', subtitle: 'Serial Entrepreneur', detail: '12 yatırım · 3 exit', location: 'İstanbul', tag: 'Verified', initials: 'KÖ' },
          { id: 'fi-6', type: 'person', title: 'Ayşe Demir', subtitle: 'Growth Fund LP', detail: 'B2B SaaS uzmanı', location: 'İstanbul', tag: 'Featured', initials: 'AD' },
          { id: 'fi-7', type: 'person', title: 'Can Vural', subtitle: 'Tech Angel', detail: 'AI & Deep Tech', location: 'Ankara', tag: 'Featured', initials: 'CV' },
        ],
      },
      {
        id: 'recently-funded',
        title: 'Son Fonlanan Startuplar',
        items: [
          { id: 'fi-8', type: 'startup', title: 'PayFlow', emoji: '💳', detail: '3.2M TL · Seed', location: 'İstanbul', tag: 'Fintech', timeAgo: '3 gün' },
          { id: 'fi-9', type: 'startup', title: 'GreenRoute', emoji: '🌿', detail: '1.8M TL · Pre-seed', location: 'Ankara', tag: 'CleanTech', timeAgo: '1 hafta' },
          { id: 'fi-10', type: 'startup', title: 'MedAssist AI', emoji: '🏥', detail: '5M TL · Seed', location: 'İzmir', tag: 'HealthTech', timeAgo: '2 hafta' },
        ],
      },
      {
        id: 'investment-tips',
        title: 'Yatırım İpuçları',
        items: [
          { id: 'fi-11', type: 'article', title: 'Pitch deck hazırlarken yapılan 7 hata', meta: '5 dk okuma', tag: 'Rehber' },
          { id: 'fi-12', type: 'article', title: 'Melek yatırımcı ile nasıl iletişim kurulur?', meta: '8 dk okuma', tag: 'Strateji' },
          { id: 'fi-13', type: 'article', title: 'Değerleme: Startupınız ne kadar eder?', meta: '12 dk okuma', tag: 'Finans' },
        ],
      },
    ],
    activity: [
      { emoji: '🟢', text: 'Elif Kaya yeni yatırımcı profili oluşturdu', time: '3 dk önce' },
      { emoji: '💰', text: 'PayFlow 3.2M TL seed yatırım aldı', time: '8 dk önce' },
      { emoji: '🟢', text: '2 yeni melek yatırımcı katıldı', time: '15 dk önce' },
    ],
  },
  {
    id: 'invest',
    label: 'Yatırım Yap',
    shortLabel: 'Yatır',
    description: 'Erken aşama fırsatlarını keşfedin ve değerlendirin.',
    accent: '#2563EB',
    accentMuted: 'bg-[#2563EB]/8 text-[#2563EB]',
    sections: [
      {
        id: 'latest-startups',
        title: 'Son Startuplar',
        items: [
          { id: 'inv-1', type: 'startup', title: 'AI CRM Platformu', emoji: '🚀', detail: '5M TL arıyor · Series A', location: 'İstanbul', tag: 'SaaS', timeAgo: '2 sa' },
          { id: 'inv-2', type: 'startup', title: 'LogiChain', emoji: '📦', detail: '2.5M TL arıyor · Seed', location: 'Ankara', tag: 'Logistics', timeAgo: '4 sa' },
          { id: 'inv-3', type: 'startup', title: 'EduVerse', emoji: '📚', detail: '800K TL arıyor · Pre-seed', location: 'İzmir', tag: 'EdTech', timeAgo: '6 sa' },
          { id: 'inv-4', type: 'startup', title: 'SecureID', emoji: '🔐', detail: '3M TL arıyor · Seed', location: 'İstanbul', tag: 'CyberSec', timeAgo: '8 sa' },
        ],
      },
      {
        id: 'featured-opportunities',
        title: 'Öne Çıkan Fırsatlar',
        items: [
          { id: 'inv-5', type: 'startup', title: 'NeuralPay', emoji: '⚡', detail: '12M TL · Series A · %18 büyüme', location: 'İstanbul', tag: 'Hot', initials: undefined },
          { id: 'inv-6', type: 'startup', title: 'FarmSense', emoji: '🌾', detail: '1.2M TL · Pre-seed · MVP hazır', location: 'Konya', tag: 'Featured' },
          { id: 'inv-7', type: 'startup', title: 'CloudOps', emoji: '☁️', detail: '4M TL · Seed · 40K MRR', location: 'İstanbul', tag: 'Featured' },
        ],
      },
      {
        id: 'active-investors',
        title: 'Aktif Yatırımcılar',
        items: [
          { id: 'inv-8', type: 'person', title: 'Burak Şahin', subtitle: 'Bu hafta 2 yatırım yaptı', detail: 'Fintech · SaaS', location: 'İstanbul', initials: 'BŞ' },
          { id: 'inv-9', type: 'person', title: 'Zeynep Ak', subtitle: 'Son yatırım: 3 gün önce', detail: 'HealthTech · AI', location: 'Ankara', initials: 'ZA' },
          { id: 'inv-10', type: 'person', title: 'Emre Koç', subtitle: 'Portfolio: 18 startup', detail: 'B2B · Marketplace', location: 'İstanbul', initials: 'EK' },
        ],
      },
      {
        id: 'investment-guides',
        title: 'Yatırım Rehberleri',
        items: [
          { id: 'inv-11', type: 'article', title: 'Due diligence checklist: Erken aşama', meta: '10 dk okuma', tag: 'Rehber' },
          { id: 'inv-12', type: 'article', title: 'Term sheet maddelerini anlama', meta: '15 dk okuma', tag: 'Hukuk' },
          { id: 'inv-13', type: 'article', title: 'Portfolio çeşitlendirme stratejileri', meta: '7 dk okuma', tag: 'Strateji' },
        ],
      },
    ],
    activity: [
      { emoji: '🔵', text: 'NeuralPay Series A turunu açtı', time: '5 dk önce' },
      { emoji: '💎', text: 'Burak Şahin FarmSense\'e yatırım yaptı', time: '11 dk önce' },
      { emoji: '🔵', text: '4 yeni startup ilanı eklendi', time: '22 dk önce' },
    ],
  },
  {
    id: 'find-job',
    label: 'İş Bul',
    shortLabel: 'İş',
    description: 'Size uygun kariyer fırsatlarını bulun.',
    accent: '#F97316',
    accentMuted: 'bg-[#F97316]/8 text-[#EA580C]',
    sections: [
      {
        id: 'latest-jobs',
        title: 'Son İlanlar',
        items: [
          { id: 'fj-1', type: 'job', title: 'Senior Frontend Developer', subtitle: 'TechCorp', detail: '45.000–60.000 TL', location: 'Uzaktan', tag: 'Tam Zamanlı', timeAgo: '30 dk' },
          { id: 'fj-2', type: 'job', title: 'Product Designer', subtitle: 'DesignHub', detail: '50.000–65.000 TL', location: 'Hibrit · İstanbul', tag: 'Hibrit', timeAgo: '1 sa' },
          { id: 'fj-3', type: 'job', title: 'Backend Engineer', subtitle: 'DataFlow', detail: '55.000–70.000 TL', location: 'İstanbul', tag: 'Tam Zamanlı', timeAgo: '2 sa' },
          { id: 'fj-4', type: 'job', title: 'Growth Marketing Lead', subtitle: 'ScaleUp', detail: '40.000–55.000 TL', location: 'Uzaktan', tag: 'Tam Zamanlı', timeAgo: '3 sa' },
        ],
      },
      {
        id: 'recommended-jobs',
        title: 'Önerilen İşler',
        items: [
          { id: 'fj-5', type: 'job', title: 'Staff Engineer', subtitle: 'Unicorn Inc.', detail: '80.000+ TL', location: 'İstanbul', tag: 'Match %94' },
          { id: 'fj-6', type: 'job', title: 'UX Researcher', subtitle: 'ProductLab', detail: '48.000 TL', location: 'Hibrit', tag: 'Match %89' },
          { id: 'fj-7', type: 'job', title: 'DevOps Engineer', subtitle: 'CloudBase', detail: '65.000 TL', location: 'Uzaktan', tag: 'Match %87' },
        ],
      },
      {
        id: 'top-companies',
        title: 'En İyi Şirketler',
        items: [
          { id: 'fj-8', type: 'company', title: 'Getir', emoji: '🛵', detail: '24 açık pozisyon', location: 'İstanbul', tag: 'Tech' },
          { id: 'fj-9', type: 'company', title: 'Insider', emoji: '📊', detail: '18 açık pozisyon', location: 'İstanbul', tag: 'SaaS' },
          { id: 'fj-10', type: 'company', title: 'Peak Games', emoji: '🎮', detail: '12 açık pozisyon', location: 'İstanbul', tag: 'Gaming' },
          { id: 'fj-11', type: 'company', title: 'Trendyol', emoji: '🛍️', detail: '31 açık pozisyon', location: 'İstanbul', tag: 'E-ticaret' },
        ],
      },
      {
        id: 'career-articles',
        title: 'Kariyer Yazıları',
        items: [
          { id: 'fj-12', type: 'article', title: '2026\'da en çok aranan 10 yetenek', meta: '6 dk okuma', tag: 'Trend' },
          { id: 'fj-13', type: 'article', title: 'Maaş müzakeresi: Doğru strateji', meta: '9 dk okuma', tag: 'Kariyer' },
          { id: 'fj-14', type: 'article', title: 'Uzaktan çalışma rehberi', meta: '5 dk okuma', tag: 'Rehber' },
        ],
      },
    ],
    activity: [
      { emoji: '🟠', text: 'TechCorp 3 yeni pozisyon açtı', time: '4 dk önce' },
      { emoji: '💼', text: '12 kişi bugün başvuru yaptı', time: '9 dk önce' },
      { emoji: '🟠', text: 'Senior Frontend ilanı trending', time: '18 dk önce' },
    ],
  },
  {
    id: 'hire',
    label: 'İşe Al',
    shortLabel: 'Al',
    description: 'Ekibinize katılacak doğru yeteneği bulun.',
    accent: '#EA580C',
    accentMuted: 'bg-[#F97316]/8 text-[#EA580C]',
    sections: [
      {
        id: 'latest-candidates',
        title: 'Son Adaylar',
        items: [
          { id: 'h-1', type: 'person', title: 'Ahmet Yılmaz', subtitle: 'Senior Frontend Dev', detail: '6 yıl · React, TS', location: 'İstanbul', tag: 'Aktif', timeAgo: '20 dk', initials: 'AY' },
          { id: 'h-2', type: 'person', title: 'Merve Çelik', subtitle: 'Product Designer', detail: '4 yıl · Figma, UX', location: 'Ankara', tag: 'Aktif', timeAgo: '45 dk', initials: 'MÇ' },
          { id: 'h-3', type: 'person', title: 'Oğuz Kaya', subtitle: 'Backend Engineer', detail: '5 yıl · Node, Go', location: 'Uzaktan', tag: 'Aktif', timeAgo: '1 sa', initials: 'OK' },
          { id: 'h-4', type: 'person', title: 'Seda Arı', subtitle: 'Data Scientist', detail: '3 yıl · Python, ML', location: 'İzmir', tag: 'Yeni', timeAgo: '2 sa', initials: 'SA' },
        ],
      },
      {
        id: 'featured-candidates',
        title: 'Öne Çıkan Adaylar',
        items: [
          { id: 'h-5', type: 'person', title: 'Cem Özkan', subtitle: 'Staff Engineer', detail: 'Ex-Google · 10 yıl', location: 'İstanbul', tag: 'Top', initials: 'CÖ' },
          { id: 'h-6', type: 'person', title: 'Dilara Tunç', subtitle: 'Engineering Manager', detail: 'Ex-Getir · 8 yıl', location: 'İstanbul', tag: 'Top', initials: 'DT' },
          { id: 'h-7', type: 'person', title: 'Barış Erdem', subtitle: 'Full Stack Dev', detail: 'Open source · 7 yıl', location: 'Uzaktan', tag: 'Featured', initials: 'BE' },
        ],
      },
      {
        id: 'active-professionals',
        title: 'En Aktif Profesyoneller',
        items: [
          { id: 'h-8', type: 'person', title: 'Ece Demir', subtitle: 'Bu hafta 5 başvuru', detail: 'Mobile · Flutter', location: 'İstanbul', initials: 'ED' },
          { id: 'h-9', type: 'person', title: 'Kaan Yurt', subtitle: 'Profil %100 tamamlandı', detail: 'DevOps · AWS', location: 'Ankara', initials: 'KY' },
          { id: 'h-10', type: 'person', title: 'Nil Güneş', subtitle: '3 yeni referans', detail: 'PM · B2B SaaS', location: 'İstanbul', initials: 'NG' },
        ],
      },
      {
        id: 'hiring-tips',
        title: 'İşe Alım İpuçları',
        items: [
          { id: 'h-11', type: 'article', title: 'İlk 10 çalışanı nasıl işe alırsınız?', meta: '8 dk okuma', tag: 'Startup' },
          { id: 'h-12', type: 'article', title: 'Teknik mülakat soruları rehberi', meta: '12 dk okuma', tag: 'Teknik' },
          { id: 'h-13', type: 'article', title: 'Employer branding stratejileri', meta: '6 dk okuma', tag: 'Marka' },
        ],
      },
    ],
    activity: [
      { emoji: '🟠', text: 'Cem Özkan profilini güncelledi', time: '6 dk önce' },
      { emoji: '👥', text: 'Startup X 2 aday ile eşleşti', time: '14 dk önce' },
      { emoji: '🟠', text: '8 yeni aday profili eklendi', time: '25 dk önce' },
    ],
  },
  {
    id: 'find-partner',
    label: 'Ortak Bul',
    shortLabel: 'Ortak',
    description: 'İşinizi birlikte büyütecek doğru ortağı bulun.',
    accent: '#8B5CF6',
    accentMuted: 'bg-[#8B5CF6]/8 text-[#7C3AED]',
    sections: [
      {
        id: 'technical-cofounders',
        title: 'Teknik Kurucu Ortaklar',
        items: [
          { id: 'fp-1', type: 'person', title: 'Tolga Aktaş', subtitle: 'CTO Adayı', detail: 'Full-stack · %15–20 equity', location: 'İstanbul', tag: 'Teknik', timeAgo: '1 sa', initials: 'TA' },
          { id: 'fp-2', type: 'person', title: 'Yiğit Polat', subtitle: 'AI/ML Lead', detail: 'PhD · Deep Tech', location: 'Ankara', tag: 'AI', timeAgo: '3 sa', initials: 'YP' },
          { id: 'fp-3', type: 'person', title: 'Arda Kılıç', subtitle: 'Mobile Architect', detail: 'iOS & Android · 8 yıl', location: 'Uzaktan', tag: 'Mobile', timeAgo: '5 sa', initials: 'AK' },
        ],
      },
      {
        id: 'business-partners',
        title: 'İş Ortakları',
        items: [
          { id: 'fp-4', type: 'person', title: 'Pınar Koç', subtitle: 'Business Dev', detail: 'B2B satış · 10 yıl', location: 'İstanbul', tag: 'Satış', initials: 'PK' },
          { id: 'fp-5', type: 'person', title: 'Murat Sezer', subtitle: 'Operations Lead', detail: 'E-ticaret · Lojistik', location: 'İzmir', tag: 'Operasyon', initials: 'MS' },
          { id: 'fp-6', type: 'person', title: 'Gizem Altın', subtitle: 'Marketing Co-founder', detail: 'Growth · D2C', location: 'İstanbul', tag: 'Pazarlama', initials: 'GA' },
        ],
      },
      {
        id: 'recently-joined',
        title: 'Yeni Katılan Üyeler',
        items: [
          { id: 'fp-7', type: 'person', title: 'Onur Tekin', subtitle: 'Fintech arıyor', detail: 'Backend · Blockchain', location: 'İstanbul', tag: 'Yeni', timeAgo: '2 sa', initials: 'OT' },
          { id: 'fp-8', type: 'person', title: 'Leyla Şen', subtitle: 'HealthTech arıyor', detail: 'Product · UX', location: 'Ankara', tag: 'Yeni', timeAgo: '4 sa', initials: 'LŞ' },
          { id: 'fp-9', type: 'person', title: 'Umut Er', subtitle: 'Marketplace arıyor', detail: 'Full-stack · React', location: 'İstanbul', tag: 'Yeni', timeAgo: '6 sa', initials: 'UE' },
          { id: 'fp-10', type: 'person', title: 'Defne Acar', subtitle: 'EdTech arıyor', detail: 'Content · Curriculum', location: 'Uzaktan', tag: 'Yeni', timeAgo: '8 sa', initials: 'DA' },
        ],
      },
      {
        id: 'success-stories',
        title: 'Başarı Hikayeleri',
        items: [
          { id: 'fp-11', type: 'story', title: 'PayRoute: İki stranger, bir unicorn', detail: 'Platform üzerinden tanıştılar · 18 ay sonra Series A', meta: 'Fintech', tag: 'Hikaye' },
          { id: 'fp-12', type: 'story', title: 'GreenBox: Teknik + iş ortaklığı', detail: 'CTO ve CEO eşleşmesi · 2M TL seed', meta: 'CleanTech', tag: 'Hikaye' },
          { id: 'fp-13', type: 'story', title: 'LearnLoop: Co-founder hikayesi', detail: '3 ayda MVP · 500K kullanıcı', meta: 'EdTech', tag: 'Hikaye' },
        ],
      },
    ],
    activity: [
      { emoji: '🟣', text: 'Tolga Aktaş ortaklık ilanı yayınladı', time: '7 dk önce' },
      { emoji: '🤝', text: 'Yeni ortaklık eşleşmesi: PayRoute', time: '16 dk önce' },
      { emoji: '🟣', text: '5 yeni co-founder profili eklendi', time: '28 dk önce' },
    ],
  },
];

export function getIntent(id: import('@/features/categories/types/category.types').CategoryIntentId) {
  return INTENTS.find((i) => i.id === id)!;
}
