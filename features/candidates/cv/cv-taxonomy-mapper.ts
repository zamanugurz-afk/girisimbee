import { getAllTaxonomyPositions, getPositionsForSector } from '@/features/candidates/taxonomy/career-taxonomy';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import type {
  AiCvExtractionPayload,
  CanonicalTaxonomyMappingResult,
  RawAmbiguousCvItem,
} from '@/features/candidates/cv/cv.types';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

import { UNIVERSAL_ROLE_ALIASES } from './cv-universal-dictionary';
import { normalizeCvText } from '@/features/candidates/cv/cv-turkish-encoding';

// Canonical Alias Dictionary for Roles (lower-case raw -> canonical Turkish Title Case)
const ROLE_ALIASES: Record<string, string> = {
  ...UNIVERSAL_ROLE_ALIASES,
  // Software / Tech
  'software engineer': 'Yazılım Geliştirici',
  'software developer': 'Yazılım Geliştirici',
  'senior software developer': 'Yazılım Geliştirici',
  'senior software engineer': 'Yazılım Geliştirici',
  'senior developer': 'Yazılım Geliştirici',
  'frontend developer': 'Frontend Geliştirici',
  'front-end developer': 'Frontend Geliştirici',
  'backend developer': 'Backend Geliştirici',
  'back-end developer': 'Backend Geliştirici',
  'full stack developer': 'Full Stack Geliştirici',
  'full-stack developer': 'Full Stack Geliştirici',
  'fullstack developer': 'Full Stack Geliştirici',
  'mobile developer': 'Mobil Uygulama Geliştirici',
  'ios developer': 'Mobil Uygulama Geliştirici',
  'android developer': 'Mobil Uygulama Geliştirici',
  'devops engineer': 'DevOps Mühendisi',
  'qa engineer': 'QA / Test uzmanı',
  'test engineer': 'QA / Test uzmanı',
  'data scientist': 'Veri Bilimci',
  'data analyst': 'Veri Analisti',
  'system admin': 'Sistem Yöneticisi',
  'system administrator': 'Sistem Yöneticisi',
  'cyber security specialist': 'Siber Güvenlik Uzmanı',
  'cyber security analyst': 'Siber Güvenlik Uzmanı',
  'cyber security & soc lead': 'Siber Güvenlik Uzmanı',
  'soc analyst': 'Siber Güvenlik Uzmanı',
  'cloud architect': 'DevOps Mühendisi',
  'security architect': 'Siber Güvenlik Uzmanı',
  'cloud infrastructure & security architect': 'DevOps Mühendisi',
  'cloud infrastructure and security architect': 'DevOps Mühendisi',
  'software architect': 'Yazılım Geliştirici',
  'softwareentwickler': 'Yazılım Geliştirici',
  'ingenieur logiciel': 'Yazılım Geliştirici',
  'ingénieur logiciel': 'Yazılım Geliştirici',
  'desarrollador full stack': 'Full Stack Geliştirici',
  'desarrollador': 'Yazılım Geliştirici',
  'développeur': 'Yazılım Geliştirici',
  'finansal güvence danışmanı': 'Sigorta Danışmanı',
  'finansal guvence danismani': 'Sigorta Danışmanı',
  'vardiya müdürü': 'Vardiya Amiri / Müdürü',
  'vardiya muduru': 'Vardiya Amiri / Müdürü',
  'kabin amiri': 'Kabin Memuru',
  'kabin memuru': 'Kabin Memuru',
  'kabin ekibi': 'Kabin Memuru',
  'hostes': 'Hostes',
  'host': 'Host',
  'başhekim': 'Başhekim',
  'sağlık yöneticisi': 'Sağlık Yöneticisi',
  'matematik öğretmeni': 'Öğretmen',
  'fizik öğretmeni': 'Öğretmen',
  'kimya öğretmeni': 'Öğretmen',
  'biyoloji öğretmeni': 'Öğretmen',
  'türkçe öğretmeni': 'Öğretmen',
  'edebiyat öğretmeni': 'Öğretmen',
  'ingilizce öğretmeni': 'Öğretmen',
  'sınıf öğretmeni': 'Öğretmen',
  'öğretmen': 'Öğretmen',
  'eğitmen': 'Eğitmen',
  'manisa yatırım operasyonları & portföy kazanımı': 'Finans Uzmanı',
  'yatırım operasyonları & portföy kazanımı': 'Finans Uzmanı',
  'yatırım operasyonları': 'Finans Uzmanı',
  'guest relations': 'Müşteri İlişkileri Yöneticisi',
  'guest relations director': 'Müşteri İlişkileri Yöneticisi',
  'guest relations manager': 'Müşteri İlişkileri Yöneticisi',
  'guest relations specialist': 'Müşteri İlişkileri Uzmanı',
  'guest relations officer': 'Müşteri İlişkileri Uzmanı',
  'müşteri ilişkileri yöneticisi': 'Müşteri İlişkileri Yöneticisi',
  'müşteri ilişkileri uzmanı': 'Müşteri İlişkileri Uzmanı',
  'kardiyoloji uzmanı': 'Doktor',
  'uzman doktor': 'Doktor',
  'doktor': 'Doktor',
  'tabip': 'Doktor',
  'hekim': 'Doktor',
  'hvac engineer': 'Makine Mühendisi',
  'iklimlendirme mühendisi': 'Makine Mühendisi',
  'mekanik tesisat mühendisi': 'Makine Mühendisi',
  'mekanik mühendisi': 'Makine Mühendisi',
  'smmm': 'Mali Müşavir',
  'serbest muhasebeci mali müşavir': 'Mali Müşavir',
  'hayat sigortaları uw müdür yardımcısı': 'Underwriter',
  'uw müdür yardımcısı': 'Underwriter',
  'hayat sigortaları kıdemli uw': 'Underwriter',
  'kıdemli uw': 'Underwriter',
  'underwriting': 'Underwriter',
  'underwriter': 'Underwriter',
  'uw': 'Underwriter',
  'görsel iletişim tasarımcısı': 'Grafik Tasarımcı',
  'ön büro şefi': 'Ön Büro Sorumlusu',
  'tiyatro oyuncusu': 'Oyuncu',
  'tiyatro sanatçısı': 'Sanatçı',
  'tiyatro sanatcisi': 'Sanatçı',
  'sanatçı': 'Sanatçı',
  'sanatci': 'Sanatçı',
  'oyuncu ve yönetmen': 'Oyuncu',
  'oyuncu': 'Oyuncu',
  'yönetmen': 'Yönetmen',
  'aktör': 'Oyuncu',
  'aktris': 'Oyuncu',
  'otomotiv gövde tasarım mühendisi': 'Otomotiv Tasarım Mühendisi',
  'gövde tasarım mühendisi': 'Otomotiv Tasarım Mühendisi',
  'gömülü sistemler mühendisi': 'Gömülü Sistemler Mühendisi',
  'gömülü yazılım mühendisi': 'Gömülü Yazılım Mühendisi',
  'elektrik bakım mühendisi': 'Elektrik Mühendisi',
  'veri mühendisi': 'Veri Mühendisi',
  'data engineer': 'Veri Mühendisi',
  'gemi kaptanı': 'Gemi Kaptanı',
  'kaptan': 'Kaptan',
  'hr director': 'İnsan Kaynakları Direktörü',
  'insan kaynakları direktörü': 'İnsan Kaynakları Direktörü',
  'veri mühendisliği müdürü': 'Veri Mühendisi',
  'aktüerya ve karşılıklar yöneticisi': 'Aktüer',
  'aktüerya yöneticisi': 'Aktüer',
  'kıdemli denetçi': 'Denetçi',
  'senior auditor': 'Denetçi',
  'bilgi güvenliği uyum yöneticisi': 'Bilgi Güvenliği Uzmanı',
  'bilgi güvenliği yöneticisi': 'Bilgi Güvenliği Uzmanı',
  'biyomedikal kalibrasyon mühendisi': 'Biyomedikal Mühendisi',
  'biyomedikal mühendisi': 'Biyomedikal Mühendisi',
  'servis ve kalibrasyon mühendisi': 'Biyomedikal Mühendisi',
  'kalibrasyon mühendisi': 'Biyomedikal Mühendisi',
  'formülasyon ve ar-ge uzmanı': 'Ar-Ge Uzmanı',
  'ar-ge uzmanı': 'Ar-Ge Uzmanı',
  'kıdemli teknik işe alım uzmanı': 'İşe Alım Uzmanı',
  'teknik işe alım uzmanı': 'İşe Alım Uzmanı',
  'tech recruiter': 'İşe Alım Uzmanı',
  'body-in-white tasarım mühendisi': 'Otomotiv Tasarım Mühendisi',
  'otomotiv tasarım mühendisi': 'Otomotiv Tasarım Mühendisi',
  'kıdemli denetim uzmanı': 'Denetçi',
  'denetim uzmanı': 'Denetçi',

  // Sales & Marketing
  'sales specialist': 'Satış Uzmanı',
  'sales executive': 'Satış Uzmanı',
  'sales representative': 'Satış Temsilcisi',
  'sales consultant': 'Satış Danışmanı',
  'satış temsilcisi': 'Satış Temsilcisi',
  'saha satış temsilcisi': 'Saha Satış Temsilcisi',
  'satış asistanı': 'Satış Danışmanı',
  'satış danışmanı': 'Satış Danışmanı',
  'satış pazarlama danışmanı': 'Satış Danışmanı',
  'satış ve pazarlama danışmanı': 'Satış Danışmanı',
  'satış yetkilisi': 'Satış Danışmanı',
  'aktif satış yöneticisi': 'Satış Müdürü',
  'aktif satış yönetmeni': 'Satış Müdürü',
  'doktor asistanı': 'Doktor Asistanı',
  'diş hekimi asistanı': 'Diş Hekimi Asistanı',
  'hasta kabul': 'Hasta Kabul Görevlisi',
  'hasta kabul görevlisi': 'Hasta Kabul Görevlisi',
  'tıbbi sekreter': 'Tıbbi Sekreter',
  'tıbbi sekreterlik': 'Tıbbi Sekreter',
  'account executive': 'Müşteri Yöneticisi',
  'account manager': 'Müşteri Yöneticisi',
  'sales manager': 'Satış Müdürü',
  'business development specialist': 'İş Geliştirme Uzmanı',
  'business development manager': 'İş Geliştirme Müdürü',
  'marketing specialist': 'Pazarlama Uzmanı',
  'digital marketing specialist': 'Dijital Pazarlama Uzmanı',
  'growth marketing specialist': 'Dijital Pazarlama Uzmanı',
  'seo specialist': 'SEO Uzmanı',
  'content specialist': 'İçerik Uzmanı',
  'social media specialist': 'Sosyal Medya Uzmanı',
  'brand manager': 'Marka Yöneticisi',

  // Product & Project Management
  'product manager': 'Ürün Yöneticisi',
  'product owner': 'Ürün Sahibi',
  'project manager': 'Proje Yöneticisi',
  'scrum master': 'Scrum Master',
  'agile coach': 'Agile Koç',

  // HR & Operations
  'hr specialist': 'İnsan Kaynakları Uzmanı',
  'human resources specialist': 'İnsan Kaynakları Uzmanı',
  'recruiter': 'İşe Alım Uzmanı',
  'talent acquisition specialist': 'İşe Alım Uzmanı',
  'hr manager': 'İnsan Kaynakları Müdürü',
  'operations specialist': 'Operasyon Uzmanı',
  'operations manager': 'Operasyon Müdürü',

  // Finance & Accounting
  'accountant': 'Muhasebe Uzmanı',
  'accounting specialist': 'Muhasebe Uzmanı',
  'financial analyst': 'Finansal Analist',
  'finance specialist': 'Finans Uzmanı',
  'finance manager': 'Finans Müdürü',
  'mali müşavir': 'Mali Müşavir',

  'yönetici': 'Operasyon Müdürü',
  'müdür': 'Operasyon Müdürü',
  'direktör': 'Operasyon Müdürü',
  'genel müdür': 'Genel Müdür',
  'operasyon yöneticisi': 'Operasyon Müdürü',
  'satış yöneticisi': 'Satış Müdürü',
  'çağrı merkezi yöneticisi': 'Çağrı Merkezi Operasyon Müdürü',

  // Design
  'ui/ux designer': 'UI/UX Tasarımcı',
  'ux designer': 'UI/UX Tasarımcı',
  'ui designer': 'UI/UX Tasarımcı',
  'graphic designer': 'Grafik Tasarımcı',
  'product designer': 'Ürün Tasarımcısı',

  // Customer Service & Operations & Sales Management
  'customer success specialist': 'Müşteri Başarı Uzmanı',
  'customer support specialist': 'Müşteri Temsilcisi',
  'call center agent': 'Çağrı Merkezi Temsilcisi',
  'call center manager': 'Çağrı Merkezi Operasyon Müdürü',
  'call center operations manager': 'Çağrı Merkezi Operasyon Müdürü',
  'call center operation manager': 'Çağrı Merkezi Operasyon Müdürü',
  'call center operations supervisor': 'Çağrı Merkezi Süpervizörü',
  'call center team leader': 'Çağrı Merkezi Takım Lideri',
  'call center lead': 'Çağrı Merkezi Takım Lideri',
  'call center supervisor': 'Çağrı Merkezi Süpervizörü',
  'çağrı merkezi operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi operasyonları müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi operasyon muduru': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi operasyonlari muduru': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi operasyon yöneticisi': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi operasyon yoneticisi': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi operasyon lideri': 'Çağrı Merkezi Takım Lideri',
  'çağrı merkezi operasyon şefi': 'Çağrı Merkezi Takım Lideri',
  'çağrı merkezi operasyon sefi': 'Çağrı Merkezi Takım Lideri',
  'çağrı merkezi operasyon takımı lideri': 'Çağrı Merkezi Takım Lideri',
  'çağrı merkezi müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'müşteri hizmetleri ve çağrı merkezi müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'müşteri deneyimi ve operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'telemarketing ve ticari destek operasyonları müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'telemarketing ve çağrı merkezi operasyonları direktörü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi elemanı': 'Çağrı Merkezi Elemanı',
  'çağrı merkezi müşteri temsilcisi': 'Çağrı Merkezi Müşteri Temsilcisi',
  'üretim elemanı': 'Üretim Elemanı',
  'mağaza elemanı': 'Mağaza Elemanı',
  'bilgi işlem elemanı': 'Bilgi İşlem Elemanı',
  'bilgi işlem sorumlusu': 'Bilgi İşlem Sorumlusu',
  'bilgi işlem uzmanı': 'Bilgi İşlem Uzmanı',
  'alternatif satış kanalları müdürü': 'Satış Müdürü',
  'sigorta çağrı merkezi operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'sigorta dijital kanal çağrı merkezi satış müdürü': 'Çağrı Merkezi Satış Müdürü',
  'outsource kanal operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi satış müdürü': 'Çağrı Merkezi Satış Müdürü',
  'çağrı merkezi takım lideri': 'Çağrı Merkezi Takım Lideri',
  'operasyon direktörü': 'Operasyon Müdürü',
  'satış direktörü': 'Satış Müdürü',
  'kanal satış müdürü': 'Satış Müdürü',
  'sales director': 'Satış Müdürü',
  'operations director': 'Operasyon Müdürü',
  'head of sales': 'Satış Müdürü',
  'head of marketing': 'Pazarlama Müdürü',
  'head of operations': 'Operasyon Müdürü',
  'audit specialist': 'Denetim Uzmanı',
  'auditor': 'Denetim Uzmanı',
  'branch manager': 'Şube Müdürü',
  'managing director': 'Genel Müdür',
  'deputy general manager': 'Genel Müdür Yardımcısı',
  'assistant general manager': 'Genel Müdür Yardımcısı',
  'vice president': 'Genel Müdür Yardımcısı',

  // Insurance & Operations & Consulting
  'sigorta danışmanı': 'Sigorta Danışmanı',
  'uzman sigorta danışmanı': 'Sigorta Danışmanı',
  'uzman sigorta danışmanı & operasyon uzmanı': 'Sigorta Danışmanı',
  'sigorta uzmanı': 'Sigorta Danışmanı',
  'sigorta teknik uzmanı': 'Sigorta Danışmanı',
  'asistans ve operasyon uzmanı': 'Operasyon Uzmanı',
  'asistans uzmanı': 'Operasyon Uzmanı',
  'kalite eğitim uzmanı': 'Eğitim Uzmanı',
  'çağrı merkezi müşteri temsilcileri kalite eğitim uzmanı': 'Eğitim Uzmanı',
  'sosyal hizmetler kıdemli stajyeri': 'Sosyal Hizmet Uzmanı',
  'sosyal hizmetler stajyeri': 'Sosyal Hizmet Uzmanı',
  'okul öncesi stajyeri': 'Okul Öncesi Öğretmeni',
  'okul öncesi öğretmeni': 'Okul Öncesi Öğretmeni',
  'sosyal hizmetler uzmanı': 'Sosyal Hizmet Uzmanı',
  'sosyal hizmet uzmanı': 'Sosyal Hizmet Uzmanı',
  'hasta hizmetleri yöneticisi': 'Hastane yöneticisi',
  'medikal direktör': 'Hastane yöneticisi',
  'tıbbi direktör': 'Hastane yöneticisi',
  'kurumsal müşteri yöneticisi': 'Müşteri Yöneticisi',
  'müşteri yöneticisi': 'Müşteri Yöneticisi',
  'aşçı': 'Aşçı',
  'executive chef': 'Aşçı',
  'şef aşçı': 'Aşçı',
  'mutfak koordinatörü': 'Aşçı',
  'mimar': 'Mimar',
  'şantiye şefi': 'Şantiye Şefi',
  'mimar & şantiye şefi': 'Şantiye Şefi',
  'avukat': 'Avukat',
  'hukuk müşaviri': 'Hukuk Danışmanı',
  'avukat & hukuk müşaviri': 'Avukat',
  'tedarik zinciri müdürü': 'Tedarik Zinciri Müdürü',
  'yapay zeka mühendisi': 'Yapay zeka / ML mühendisi',
  'yapay zeka uzmanı': 'Yapay zeka / ML mühendisi',
  'araştırma görevlisi': 'Eğitmen / öğretmen',
  'ağır vasıta şoförü': 'Şoför (Kamyon / TIR)',
  'ağır vasıta sürücüsü': 'Şoför (Kamyon / TIR)',
  'continuous improvement lead': 'Üretim Mühendisi',
  'uzak yol vardiya zabiti': 'Gemi Kaptanı',
  'ikinci kaptan': 'Gemi Kaptanı',
  'b1 lisanslı teknisyen': 'Uçak Bakım Teknisyeni',
  'uçak bakım teknisyeni': 'Uçak Bakım Teknisyeni',
  'ges proje mühendisi': 'Proje Mühendisi',
  'kategori satın alma müdürü': 'Satın Alma Müdürü',
  'fmcg buyer': 'Satın Alma Müdürü',
  'gümrük müşaviri': 'Gümrük Müşaviri',
  'fizyoterapist': 'Fizyoterapist',
  'klinik psikolog': 'Psikolog',
  'veteriner hekim': 'Veteriner Hekim',
  'diş hekimi': 'Diş Hekimi',
  'halkla ilişkiler uzmanı': 'Halkla İlişkiler Uzmanı',
  'kurumsal iletişim müdürü': 'Kurumsal İletişim Müdürü',
  'e-ticaret kategori müdürü': 'Kategori Müdürü',
  'pazaryeri entegrasyon uzmanı': 'E-Ticaret Uzmanı',
  'idari işler müdürü': 'İdari İşler Müdürü',
  'çevre mühendisi': 'Çevre Mühendisi',
  'gıda kalite güvence uzmanı': 'Kalite Kontrol Uzmanı',
  'ziraat mühendisi': 'Ziraat Mühendisi',
  'ziraat ve sulama mühendisi': 'Ziraat Mühendisi',
  'maden mühendisi': 'Maden Mühendisi',
  'maden jeolojisi uzmanı': 'Maden Mühendisi',
  'elektrik dağıtım saha şefi': 'Elektrik Mühendisi',
  'mekanik tesisat proje yöneticisi': 'Proje Yöneticisi',
  'regulatory affairs manager': 'İlaç Ruhsatlandırma Müdürü',
  'statik proje tasarım mühendisi': 'İnşaat Mühendisi',
  'statik tasarım mühendisi': 'İnşaat Mühendisi',
  'peyzaj mimarı': 'Mimar',
  'body in white tasarım mühendisi': 'Otomotiv Mühendisi',
  'res saha mühendisi': 'Enerji Mühendisi',
  'bilgi güvenliği uyum müdürü': 'Bilgi Güvenliği Yöneticisi',
  'ulusal zincir müşteri yöneticisi': 'Key Account Manager',
  'müşteri başarı yöneticisi': 'Müşteri Başarı Yöneticisi',
  'customer success manager': 'Müşteri Başarı Yöneticisi',
  'visual merchandising manager': 'Görsel Düzenleme Yöneticisi',
  'visual merchandising lead': 'Görsel Düzenleme Yöneticisi',
  'görsel düzenleme yöneticisi': 'Görsel Düzenleme Yöneticisi',
  'görsel düzenleme müdürü': 'Görsel Düzenleme Yöneticisi',
  'şoför': 'Makam Şoförü / Şoför',
  'mağaza müdürü': 'Mağaza Müdürü',
  'ön büro müdürü': 'Ön Büro Müdürü',
  'otel resepsiyonisti': 'Otel resepsiyonisti',
  'veritabanı yöneticisi': 'Sistem yöneticisi',
  'database administrator': 'Sistem yöneticisi',
  'dba': 'Sistem yöneticisi',
  'video editörü': 'Grafik tasarımcı',
  'asistans hizmetleri': 'Operasyon Uzmanı',
  'tıbbi satış mümessili': 'Saha satış uzmanı',
  'siber güvenlik uzmanı': 'Mühendis (yazılım)',
  'veri mühendisi': 'Data engineer',
  'qa automation engineer': 'QA / Test uzmanı',
  'test otomasyon mühendisi': 'QA / Test uzmanı',
  'yazılım test mühendisi': 'QA / Test uzmanı',
  'senior qa automation engineer': 'QA / Test uzmanı',
  'test uzmanı': 'QA / Test uzmanı',
  'yazılım test uzmanı': 'QA / Test uzmanı',
  'dijital pazarlama ve seo uzmanı': 'Dijital Pazarlama Uzmanı',
  'dijital pazarlama uzmanı': 'Dijital Pazarlama Uzmanı',
  'insan kaynakları iş ortağı': 'İnsan Kaynakları Uzmanı',
  'insan kaynakları uzmanı': 'İnsan Kaynakları Uzmanı',
  'kıdemli finansal analist': 'Finansal Analist',
  'ulusal zincir mağazalar satış müdürü': 'Satış Müdürü',
  'finansal denetim stajyeri': 'Denetim Uzmanı',

  // Finance, Economics, Banking & Investment
  'ekonomi & finans uzmanı': 'Finans Uzmanı',
  'ekonomi ve finans uzmanı': 'Finans Uzmanı',
  'ekonomi ve finans': 'Finans Uzmanı',
  'ekonomi & finans': 'Finans Uzmanı',
  'finans uzmanı': 'Finans Uzmanı',
  'finansal analist': 'Finansal Analist',
  'finans analisti': 'Finansal Analist',
  'yatırım uzmanı': 'Yatırım Danışmanı',
  'yatırım danışmanı': 'Yatırım Danışmanı',
  'yatırım operasyonları': 'Finans Uzmanı',
  'yatırım operasyonları & portföy kazanımı': 'Finans Uzmanı',
  'portföy yöneticisi': 'Finans Uzmanı',
  'portföy uzmanı': 'Finans Uzmanı',
  'portföy danışmanı': 'Finans Uzmanı',
  'menkul değerler uzmanı': 'Finans Uzmanı',

  // Engineering & Technical
  'civil engineer': 'İnşaat Mühendisi',
  'inşaat mühendisi': 'İnşaat Mühendisi',
  'mechanical engineer': 'Makine Mühendisi',
  'makine mühendisi': 'Makine Mühendisi',
  'electrical engineer': 'Elektrik / Elektronik Mühendisi',
  'elektrik mühendisi': 'Elektrik / Elektronik Mühendisi',
  'elektrik elektronik mühendisi': 'Elektrik / Elektronik Mühendisi',
  'industrial engineer': 'Endüstri Mühendisi',
  'endüstri mühendisi': 'Endüstri Mühendisi',

  // Logistics & Supply Chain
  'logistics specialist': 'Lojistik Uzmanı',
  'lojistik uzmanı': 'Lojistik Uzmanı',
  'warehouse manager': 'Depo Müdürü',
  'depo müdürü': 'Depo Müdürü',
  'depo sorumlusu': 'Depo Sorumlusu',
  'procurement specialist': 'Satınalma Uzmanı',
  'satınalma uzmanı': 'Satınalma Uzmanı',

  // Healthcare
  'doctor': 'Doktor',
  'doktor': 'Doktor',
  'hekim': 'Doktor',
  'nurse': 'Hemşire',
  'hemşire': 'Hemşire',
  'pharmacist': 'Eczacı',
  'eczacı': 'Eczacı',

  // Legal & Compliance
  'legal counsel': 'Hukuk Danışmanı',
  'hukuk danışmanı': 'Hukuk Danışmanı',
  'compliance specialist': 'Uyum Uzmanı',
  'uyum uzmanı': 'Uyum Uzmanı',

  // Education & Academics
  'öğretim görevlisi': 'Eğitmen / öğretmen',
  'academician': 'Eğitmen / öğretmen',
  'akademisyen': 'Eğitmen / öğretmen',
  'öğretmen': 'Eğitmen / öğretmen',
  'eğitmen': 'Eğitmen / öğretmen',

  // Retail & Hospitality
  'store manager': 'Mağaza Müdürü',
  'cashier': 'Kasiyer',
  'kasiyer': 'Kasiyer',
  'hotel manager': 'Otel Müdürü',
  'otel müdürü': 'Otel Müdürü',
  'receptionist': 'Resepsiyonist',
  'resepsiyonist': 'Resepsiyonist',

  // Quality & Testing
  'quality assurance engineer': 'Yazılım Test Mühendisi',
  'quality control specialist': 'Kalite Kontrol Uzmanı',
  'kalite kontrol uzmanı': 'Kalite Kontrol Uzmanı',
};

// Canonical Alias Dictionary for Sectors
const SECTOR_ALIASES: Record<string, string> = {
  'it': 'Bilişim / Yazılım',
  'it sektörü': 'Bilişim / Yazılım',
  'software': 'Bilişim / Yazılım',
  'tech': 'Bilişim / Yazılım',
  'technology': 'Bilişim / Yazılım',
  'bilişim': 'Bilişim / Yazılım',
  'yazılım': 'Bilişim / Yazılım',
  'bilgi teknolojileri': 'Bilişim / Yazılım',
  'yapay zeka': 'Yapay zeka / Veri',
  'veri bilimi': 'Yapay zeka / Veri',
  'data science': 'Yapay zeka / Veri',
  'siber güvenlik': 'Bilişim / Yazılım',
  'cyber security': 'Bilişim / Yazılım',

  'finance': 'Finans / Bankacılık',
  'banking': 'Finans / Bankacılık',
  'fintech': 'Finans / Bankacılık',
  'bankacılık': 'Finans / Bankacılık',
  'finans': 'Finans / Bankacılık',
  'sermaye piyasası': 'Finans / Bankacılık',
  'ekonomi': 'Finans / Bankacılık',
  'ekonomi ve finans': 'Finans / Bankacılık',
  'yatırım': 'Finans / Bankacılık',
  'menkul değerler': 'Finans / Bankacılık',
  'portföy': 'Finans / Bankacılık',
  'finans / bankacılık': 'Finans / Bankacılık',

  'insurance': 'Sigorta',
  'sigorta': 'Sigorta',
  'sigortacılık': 'Sigorta',
  'asistans': 'Sigorta',
  'asistans hizmetleri': 'Sigorta',

  'call center': 'Çağrı merkezi',
  'çağrı merkezi': 'Çağrı merkezi',
  'cagri merkezi': 'Çağrı merkezi',
  'customer service': 'Müşteri hizmetleri',
  'customer success': 'Müşteri hizmetleri',
  'müşteri hizmetleri': 'Müşteri hizmetleri',

  'sales': 'Satış',
  'satış': 'Satış',

  'hr': 'İnsan kaynakları',
  'human resources': 'İnsan kaynakları',
  'insan kaynakları': 'İnsan kaynakları',
  'personel': 'İnsan kaynakları',

  'sağlık': 'Sağlık',
  'saglik': 'Sağlık',
  'sağlık sektörü': 'Sağlık',
  'sağlık / medikal': 'Sağlık',
  'saglik / medikal': 'Sağlık',
  'sağlık ve medikal': 'Sağlık',
  'health': 'Sağlık',
  'healthcare': 'Sağlık',
  'hospital': 'Sağlık',
  'hastane': 'Sağlık',
  'tıp': 'Sağlık',
  'tip': 'Sağlık',
  'kardiyoloji': 'Sağlık',
  'kardiyolog': 'Sağlık',
  'doktor': 'Sağlık',
  'hekim': 'Sağlık',
  'eczane': 'Sağlık',
  'eczacılık': 'Sağlık',
  'klinik': 'Sağlık',

  'müşteri hizmetleri / çağrı merkezi': 'Çağrı merkezi',
  'musteri hizmetleri / cagri merkezi': 'Çağrı merkezi',
  'perakende / mağazacılık': 'Perakende / Mağaza',
  'perakende / magazacilik': 'Perakende / Mağaza',

  'gıda': 'Gıda / Restoran',
  'gida': 'Gıda / Restoran',
  'gıda sektörü': 'Gıda / Restoran',
  'food': 'Gıda / Restoran',

  'retail': 'Perakende / Mağaza',
  'perakende': 'Perakende / Mağaza',
  'mağaza': 'Perakende / Mağaza',
  'mağazacılık': 'Perakende / Mağaza',
  'e-commerce': 'E-ticaret / Pazaryeri',
  'ecommerce': 'E-ticaret / Pazaryeri',
  'e-ticaret': 'E-ticaret / Pazaryeri',
  'eticaret': 'E-ticaret / Pazaryeri',

  'production': 'Üretim / Sanayi',
  'manufacturing': 'Üretim / Sanayi',
  'üretim': 'Üretim / Sanayi',
  'imalat': 'Üretim / Sanayi',
  'üretim / imalat': 'Üretim / Sanayi',
  'sanayi': 'Üretim / Sanayi',

  'construction': 'İnşaat / Gayrimenkul',
  'real estate': 'İnşaat / Gayrimenkul',
  'inşaat': 'İnşaat / Gayrimenkul',
  'gayrimenkul': 'İnşaat / Gayrimenkul',
  'mimarlık': 'İnşaat / Gayrimenkul',
  'şantiye': 'İnşaat / Gayrimenkul',

  'logistics': 'Lojistik / Depolama',
  'transportation': 'Lojistik / Depolama',
  'lojistik': 'Lojistik / Depolama',
  'tedarik zinciri': 'Lojistik / Depolama',
  'ulaşım': 'Ulaşım / Şoförlük',
  'şoförlük': 'Ulaşım / Şoförlük',

  'marketing': 'Pazarlama / Reklam',
  'advertising': 'Pazarlama / Reklam',
  'pazarlama': 'Pazarlama / Reklam',
  'reklam': 'Pazarlama / Reklam',
  'dijital pazarlama': 'Pazarlama / Reklam',

  'hukuk': 'Hukuk',
  'law': 'Hukuk',
  'avukatlık': 'Hukuk',

  'education': 'Eğitim',
  'eğitim': 'Eğitim',
  'öğretmenlik': 'Eğitim',
  'akademik': 'Eğitim',

  'sosyal hizmet': 'Sosyal hizmet / STK',
  'sosyal hizmetler': 'Sosyal hizmet / STK',
  'stk': 'Sosyal hizmet / STK',

  'energy': 'Enerji',
  'enerji': 'Enerji',
  'automotive': 'Otomotiv',
  'otomotiv': 'Otomotiv',
  'tourism': 'Turizm / Otelcilik',
  'turizm': 'Turizm / Otelcilik',
  'otelcilik': 'Turizm / Otelcilik',
  'restoran': 'Gıda / Restoran',
  'havacılık': 'Havacılık',
  'aviation': 'Havacılık',
  'denizcilik': 'Denizcilik / Liman',
  'maritime': 'Denizcilik / Liman',
  'gümrük': 'Gümrük',
  'customs': 'Gümrük',
  'madencilik': 'Madencilik',
  'mining': 'Madencilik',
  'veteriner': 'Veteriner / Pet',
  'tesisat': 'İklimlendirme / Tesisat',
  'iklimlendirme': 'İklimlendirme / Tesisat',
  'idari işler': 'İdari işler / Ofis',
  'halkla ilişkiler': 'Halkla ilişkiler',
  'ilaç': 'Eczane / İlaç',
  'pharma': 'Eczane / İlaç',
};

function normalizeTrMatch(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the closest canonical taxonomy position.
 */
export function matchCanonicalPosition(rawRole: string): {
  canonical: string;
  isAmbiguous: boolean;
  candidates: string[];
} {
  if (!rawRole) {
    return { canonical: '', isAmbiguous: false, candidates: [] };
  }
  const clean = rawRole.trim().toLowerCase();
  const norm = normalizeTrMatch(rawRole);

  if (/^(?:curriculum\s*vitae|cv|resume|ozgecmis(?:\s*formu)?|portfolio|referanslar|egitim|deneyim)$/i.test(norm)) {
    return { canonical: '', isAmbiguous: false, candidates: [] };
  }

  const allPositions = getAllTaxonomyPositions();

  // 1. Direct Canonical Match or Direct Alias Match
  const exactCanonical = allPositions.find((p) => p.toLowerCase() === clean || normalizeTrMatch(p) === norm);
  if (exactCanonical) {
    return { canonical: exactCanonical, isAmbiguous: false, candidates: [exactCanonical] };
  }

  if (ROLE_ALIASES[clean]) {
    return {
      canonical: ROLE_ALIASES[clean],
      isAmbiguous: false,
      candidates: [ROLE_ALIASES[clean]],
    };
  }

  // 2. Exact Normalized Alias Match
  for (const [aliasKey, canonicalVal] of Object.entries(ROLE_ALIASES)) {
    if (normalizeTrMatch(aliasKey) === norm) {
      return {
        canonical: canonicalVal,
        isAmbiguous: false,
        candidates: [canonicalVal],
      };
    }
  }

  // 3. Sorted Substring Alias Match (longest first, requiring at least 2 words or exact match)
  const sortedAliases = Object.entries(ROLE_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [aliasKey, canonicalVal] of sortedAliases) {
    const aliasNorm = normalizeTrMatch(aliasKey);
    if (aliasNorm.length >= 6 && aliasNorm.includes(' ') && norm.includes(aliasNorm)) {
      return {
        canonical: canonicalVal,
        isAmbiguous: false,
        candidates: [canonicalVal],
      };
    }
  }

  // 3. Relevance-scored candidate match
  const scoreMatch = (candidate: string): number => {
    const pNorm = normalizeTrMatch(candidate);
    if (pNorm === norm) return 1000;

    // Strictly block false domain mappings (e.g. general 'yönetici' matching 'hastane yöneticisi')
    const isHealthcareRole = pNorm.includes('hastane') || pNorm.includes('hemsire') || pNorm.includes('doktor') || pNorm.includes('saglik') || pNorm.includes('klinik');
    const isHealthcareQuery = norm.includes('hastane') || norm.includes('hemsire') || norm.includes('doktor') || norm.includes('saglik') || norm.includes('klinik');
    if (isHealthcareRole && !isHealthcareQuery) {
      return 0;
    }

    // Do not collapse specific multi-word titles into single generic words (e.g. 'müdür', 'uzman', 'şef')
    const isSingleGenericWord = /^(mudur|uzman|sef|yonetici|danisman|gorevli|yetkili|sorumlu)$/.test(pNorm);
    if (isSingleGenericWord && norm.split(' ').length >= 2) {
      return 0;
    }

    // Require full word match or long substring (>= 5 chars) with word boundary
    if (norm.length >= 5 && pNorm.includes(norm)) return 300 + norm.length;
    if (pNorm.length >= 5 && norm.includes(pNorm)) return 500 + pNorm.length;

    const GENERIC_TITLE_MODIFIERS = new Set([
      'gorev', 'gorevi', 'gorevlisi', 'gorevli', 'yetkili', 'yetkilisi',
      'eleman', 'elemani', 'personel', 'personeli', 'sorumlu', 'sorumlusu',
      'asistan', 'asistani', 'uzman', 'uzmani', 'mudur', 'muduru', 'yonetici',
      'yoneticisi', 'baskan', 'baskani', 'lider', 'lideri', 'sef', 'sefi',
      'memur', 'memuru', 'stajyer', 'stajyeri', 'temsilci', 'temsilcisi',
      'muhendis', 'muhendisi', 'muhendislik', 'tekniker', 'teknikeri',
      'teknisyen', 'teknisyeni', 'danisman', 'danismani', 'yardimci', 'yardimcisi',
      'kidemli', 'junior', 'senior', 'mid', 'lead', 'bas',
    ]);

    const FILLER_TEST_WORDS = new Set([
      'bilinmeyen', 'alakasiz', 'ornek', 'deneme', 'metin', 'yazi', 'belge',
      'dosya', 'dokuman', 'foto', 'test', 'fake', 'dummy', 'unnamed', 'unknown',
    ]);

    const queryWords = norm.split(' ').filter((w) => w.length >= 3 && !FILLER_TEST_WORDS.has(w));
    const candWords = pNorm.split(' ').filter((w) => w.length >= 3);
    let domainMatches = 0;
    let modifierMatches = 0;
    for (const qw of queryWords) {
      for (const cw of candWords) {
        const isGeneric = GENERIC_TITLE_MODIFIERS.has(qw) || GENERIC_TITLE_MODIFIERS.has(cw);
        if (cw === qw) {
          if (isGeneric) modifierMatches += 15;
          else domainMatches += 60;
        } else if (
          (qw.length >= 6 && cw.startsWith(qw.slice(0, 5))) ||
          (cw.length >= 6 && qw.startsWith(cw.slice(0, 5)))
        ) {
          if (isGeneric) modifierMatches += 10;
          else domainMatches += 40;
        }
      }
    }
    if (domainMatches === 0) return 0;
    return domainMatches + modifierMatches;
  };

  const matches = allPositions
    .map((p) => ({ position: p, score: scoreMatch(p) }))
    .filter((m) => m.score >= 10)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.position);

  if (matches.length >= 1 && scoreMatch(matches[0]) >= 30) {
    return { canonical: matches[0], isAmbiguous: true, candidates: matches.slice(0, 3) };
  }

  // 4. Default: If no close match is found in canonical taxonomy catalog, return empty string
  return {
    canonical: '',
    isAmbiguous: true,
    candidates: matches.slice(0, 3),
  };
}

/**
 * Finds the closest canonical taxonomy sector.
 */
export function matchCanonicalSector(rawSector: string): {
  canonical: string;
  isAmbiguous: boolean;
  candidates: string[];
} {
  const clean = rawSector.trim().toLowerCase();
  const norm = normalizeTrMatch(rawSector);

  // 1. Direct Alias
  if (SECTOR_ALIASES[clean]) {
    return {
      canonical: SECTOR_ALIASES[clean],
      isAmbiguous: false,
      candidates: [SECTOR_ALIASES[clean]],
    };
  }

  for (const [aliasKey, canonicalVal] of Object.entries(SECTOR_ALIASES)) {
    const aliasNorm = normalizeTrMatch(aliasKey);
    if (norm === aliasNorm || (aliasNorm.length >= 4 && norm.includes(aliasNorm))) {
      return {
        canonical: canonicalVal,
        isAmbiguous: false,
        candidates: [canonicalVal],
      };
    }
  }

  // 2. Exact in options
  const exact = JOB_SECTOR_OPTIONS.find((s) => normalizeTrMatch(s) === norm);
  if (exact) {
    return {
      canonical: exact,
      isAmbiguous: false,
      candidates: [exact],
    };
  }
  const scoreSector = (candidate: string): number => {
    const sNorm = normalizeTrMatch(candidate);
    if (sNorm === norm) return 1000;
    if (norm.includes(sNorm)) return 500 + sNorm.length;
    if (sNorm.includes(norm)) return 300 + norm.length;
    const queryWords = norm.split(' ').filter((w) => w.length >= 3);
    const candWords = sNorm.split(' ').filter((w) => w.length >= 3);
    let common = 0;
    for (const qw of queryWords) {
      if (candWords.some((cw) => cw === qw)) {
        common += 10;
      } else if (candWords.some((cw) => cw.includes(qw) || qw.includes(cw))) {
        common += 5;
      }
    }
    return common;
  };

  const matches = [...JOB_SECTOR_OPTIONS]
    .map((s) => ({ sector: s, score: scoreSector(s) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.sector);

  if (matches.length >= 1 && scoreSector(matches[0]) >= 300) {
    return {
      canonical: matches[0],
      isAmbiguous: false,
      candidates: matches.slice(0, 3),
    };
  }

  if (matches.length >= 1) {
    return {
      canonical: matches[0],
      isAmbiguous: true,
      candidates: matches.slice(0, 3),
    };
  }

  return {
    canonical: suggestTitleCaseTr(rawSector),
    isAmbiguous: true,
    candidates: [...JOB_SECTOR_OPTIONS].slice(0, 3),
  };
}

export function inferSectorFromRole(role: string): string {
  if (!role) return '';
  const r = normalizeTrMatch(role);
  if (/havacilik|ucak|pilot|kabin/i.test(r)) return 'Havacılık';
  if (/denizcilik|gemi|kaptan|liman/i.test(r)) return 'Denizcilik / Liman';
  if (/otomotiv|arac|vasita|body\s*in\s*white|otomobil|tofas|renault|ford|toyota|hyundai/i.test(r)) return 'Otomotiv';
  if (/enerji|ruzgar|gunes|santral|\bres\b|\bges\b|solar|wind/i.test(r)) return 'Enerji';
  if (/gida|sut|restoran|mutfak|aşçı|chef|barista/i.test(r)) return 'Gıda / Restoran';
  if (/maden|jeoloji|cevher/i.test(r)) return 'Madencilik';
  if (/eczane|ilac|farmasotik|ruhsatlandirma|onkoloji|klinik\s*arastirma|cra|clinical/i.test(r)) return 'Eczane / İlaç';
  if (/veteriner|pet/i.test(r)) return 'Veteriner / Pet';
  if (/saglik|doktor|hemsire|cerrah|hasta\s*hizmet|medikal|biyomedikal|psikolog|fizyoterapist|dis\s*hekimi|fizik\s*tedavi/i.test(r)) return 'Sağlık';
  if (/yazilim|gelistirici|developer|software|devops|qa|frontend|backend|full\s*stack|siber|cyber|soc|cloud|architect|mimari|sistem|network|veritabani|database|sql|bilgi\s*guvenlig|it\s*guvenlik|security|urun\s*yonetici|product\s*manager|product\s*owner/i.test(r)) return 'Bilişim / Yazılım';
  if (/yapay\s*zeka|veri\s*(?:bilim|muhend|analis|mimari|yonet|ambari)|data\s*(?:engineer|scientist|analyst|architect)|is\s*zekasi|\bbi\b/i.test(r)) return 'Yapay zeka / Veri';
  if (/sigorta|hasar|aktuer|underwrit|\buw\b|guvence\s*danisman|emeklilik/i.test(r)) return 'Sigorta';
  if (/finans|banka|yatirim|portfoy|hisse|borsa|fon|kredi|hazine/i.test(r)) return 'Finans / Bankacılık';
  if (/muhasebe|mali\s*musavir|denetim|audit/i.test(r)) return 'Muhasebe / Mali müşavirlik';
  if (/key\s*account|account\s*manager|kam|ulusal\s*zincir|musteri\s*yonetici|satis|sales|is\s*gelistirme|mumessil|merchandis/i.test(r)) return 'Satış';
  if (/cagri\s*merkezi|call\s*center|telemarketing/i.test(r)) return 'Çağrı merkezi';
  if (/musteri\s*(hizmet|iliski|basari|temsil)/i.test(r)) return 'Müşteri hizmetleri';
  if (/insan\s*kaynak|hr|recruiter|yetenek|bordro|is\s*ortag|partner/i.test(r)) return 'İnsan kaynakları';
  if (/mimar|peyzaj|insaat|santiye|gayrimenkul|emlak|statik|geoteknik/i.test(r)) return 'İnşaat / Gayrimenkul';
  if (/tedarik|lojistik|depo|sevkiyat|satinalma|procurement/i.test(r)) return 'Lojistik / Depolama';
  if (/tesisat|iklimlendirme/i.test(r)) return 'İklimlendirme / Tesisat';
  if (/e-ticaret|eticaret|pazaryeri/i.test(r)) return 'E-ticaret / Pazaryeri';
  if (/halkla\s*iliskiler|pr\s*danisman/i.test(r)) return 'Halkla ilişkiler';
  if (/pazarlama|marketing|seo|sosyal\s*medya|icerik|grafik|video|kurgu|animasyon|sanat|metin\s*yaz|kurumsal\s*iletisim|(?:gorsel|web|grafik|ui|ux)\s*tasarim/i.test(r)) return 'Pazarlama / Reklam';
  if (/tasarim\s*muhend/i.test(r)) return 'Üretim / Sanayi';
  if (/idari\s*isler|tesis\s*yonet/i.test(r)) return 'İdari işler / Ofis';
  if (/elektrik|elektronik/i.test(r)) return 'Elektrik-elektronik';
  if (/kimya|plastik|ziraat/i.test(r)) return 'Kimya / Plastik';
  if (/uretim|imalat|sanayi|fabrika|makine\s*muhend|cevre\s*muhend|surekli\s*iyilestirme|yalin\s*uretim|kalite\s*muhend/i.test(r)) return 'Üretim / Sanayi';
  if (/magaza|kasiyer|perakende|gorsel\s*duzenleme|visual\s*merchandis/i.test(r)) return 'Perakende / Mağaza';
  if (/otel|resepsiyon|on\s*buro|turizm/i.test(r)) return 'Turizm / Otelcilik';
  if (/sosyal\s*hizmet|stk|vakif|dernek/i.test(r)) return 'Sosyal hizmet / STK';
  if (/avukat|hukuk|legal/i.test(r)) return 'Hukuk';
  if (/ogretmen|egitmen|egitim|akademisyen|arastirma|ogretim|profesor|docent|okutman|zumre/i.test(r)) return 'Eğitim';
  if (/sofor|surucu|kurye|nakliye|kamyon|tir/i.test(r)) return 'Ulaşım / Şoförlük';
  if (/gumruk/i.test(r)) return 'Gümrük';
  return '';
}

/**
 * Maps raw extraction payload into Girişimbee canonical taxonomy.
 */
export function mapCvToCanonicalTaxonomy(
  payload: AiCvExtractionPayload,
): CanonicalTaxonomyMappingResult {
  const ambiguousItems: RawAmbiguousCvItem[] = [...(payload.ambiguousItems || [])];

  // 1. Map Roles
  const matchedRoles: string[] = [];
  for (const r of payload.roles || []) {
    const res = matchCanonicalPosition(r);
    if (res.canonical && !matchedRoles.includes(res.canonical)) {
      matchedRoles.push(res.canonical);
    }
    if (res.isAmbiguous && !ambiguousItems.some((a) => a.raw === r)) {
      ambiguousItems.push({
        raw: r,
        kind: 'role',
        candidates: res.candidates,
        suggestedCanonical: res.canonical,
      });
    }
  }

  // 2. Map Sectors
  const matchedSectors: string[] = [];
  for (const s of payload.sectors || []) {
    const res = matchCanonicalSector(s);
    if (!matchedSectors.includes(res.canonical)) {
      matchedSectors.push(res.canonical);
    }
    if (res.isAmbiguous && !ambiguousItems.some((a) => a.raw === s)) {
      ambiguousItems.push({
        raw: s,
        kind: 'sector',
        candidates: res.candidates,
        suggestedCanonical: res.canonical,
      });
    }
  }

  // Helper to infer appropriate sector for an individual experience
  const inferExpSector = (exp: { sector?: string; role?: string; company?: string }): string => {
    const compNorm = (exp.company || '').toLowerCase();
    if (/sigorta|emeklilik|hayat|zurich|mapfre|viennalife|allianz|anadolu\s*hayat|aksigorta/i.test(compNorm)) {
      return 'Sigorta';
    }
    if (/bank|banka|hazine|yatirim|portfoy/i.test(compNorm)) {
      return 'Finans / Bankacılık';
    }
    if (/hotel|otel|resort|tatil\s*koyu|rixos|hilton|marriott/i.test(compNorm)) {
      return 'Turizm / Otelcilik';
    }
    if (exp.role) {
      const fromRole = inferSectorFromRole(exp.role);
      if (fromRole) return fromRole;
    }
    const text = `${exp.company || ''} ${exp.role || ''}`.toLowerCase();
    const fromText = inferSectorFromRole(text);
    if (fromText) return fromText;
    if (exp.sector) {
      const match = matchCanonicalSector(exp.sector);
      if (match.canonical) return match.canonical;
    }
    return matchedSectors[0] || '';
  };

  // 3. Map Experiences (sorted by recency so current/latest job is first)
  const sortedRawExperiences = [...(payload.experiences || [])].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    const aEnd = a.endYear ?? a.startYear ?? 0;
    const bEnd = b.endYear ?? b.startYear ?? 0;
    if (bEnd !== aEnd) return bEnd - aEnd;
    const aStart = a.startYear ?? 0;
    const bStart = b.startYear ?? 0;
    return bStart - aStart;
  });

  const allTaxonomyPositions = getAllTaxonomyPositions();

  const experiences: CareerExperience[] = sortedRawExperiences.map((exp, idx) => {
    const resolvedSector = inferExpSector(exp);
    const sectorPositions = getPositionsForSector(resolvedSector);

    let matchedExpRole = '';
    if (exp.role) {
      const roleMatch = matchCanonicalPosition(exp.role);
      if (roleMatch.canonical) {
        matchedExpRole = roleMatch.canonical;
      }
    }

    const startYear = exp.startYear ?? null;
    const endYear = exp.isCurrent ? null : (exp.endYear ?? null);
    const duration = exp.durationYears
      ? `${exp.durationYears} yıl`
      : startYear && endYear
        ? `${Math.max(1, endYear - startYear)} yıl`
        : '1 yıl';

    const selectedResponsibilities = exp.responsibilities
      ? exp.responsibilities
          .split(/[|·•\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 3)
      : [];

    const selectedAchievements = exp.achievements
      ? exp.achievements
          .split(/[|·•\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 3)
      : [];

    return {
      id: `cv-exp-${idx + 1}-${Date.now() + idx}`,
      sector: resolvedSector,
      role: matchedExpRole,
      roleOther: !matchedExpRole && exp.role ? suggestTitleCaseTr(exp.role) : undefined,
      company: exp.company ? suggestTitleCaseTr(exp.company) : undefined,
      startYear,
      endYear,
      isCurrent: exp.isCurrent ?? false,
      duration,
      responsibilities: exp.responsibilities ? exp.responsibilities.trim() : '',
      selectedResponsibilities,
      responsibilitiesOther: exp.responsibilities ? exp.responsibilities.trim() : undefined,
      achievements: exp.achievements ? exp.achievements.trim() : '',
      selectedAchievements,
      achievementsOther: exp.achievements ? exp.achievements.trim() : undefined,
    };
  });

  // 4. Skills & Tools
  const KNOWN_UPPERCASE_ACRONYMS = new Set([
    'SIEM', 'AWS', 'GCP', 'SAP', 'CRM', 'ERP', 'SQL', 'API', 'CI/CD', 'SEO', 'HR', 'IT', 'BI', 'SPSS', 'ETL', 'REST', 'JIRA', 'HTML', 'CSS', 'CAD', 'CAM', 'CNC', 'PLC', 'GIS', 'BIM', 'ADR', 'SRC', 'IFRS', 'SPK', 'SMMM', 'CEH', 'OSCP', 'CISA', 'CISM', 'CISSP', 'CCNA', 'CCNP', 'PMP', 'TOGAF', 'PDKS', 'ISO', 'HACCP', 'EDR', 'SOC', 'SCADA', 'IATF', 'MEB', 'UDY', 'ODY', 'YDS', 'TOEFL', 'IELTS', 'CKA'
  ]);

  const formatSkillOrTool = (item: string): string => {
    return item
      .split(/\s+/)
      .map((word) => {
        const upper = word.trim().toUpperCase();
        if (KNOWN_UPPERCASE_ACRONYMS.has(upper)) return upper;
        return suggestTitleCaseTr(word);
      })
      .join(' ');
  };

  const professionalSkills = (payload.skills || [])
    .filter((s) => !isTechnicalSkill(s))
    .map(formatSkillOrTool);

  const technicalSkills = (payload.skills || [])
    .filter((s) => isTechnicalSkill(s))
    .map(formatSkillOrTool);

  const tools = (payload.tools || []).map(formatSkillOrTool);

  // 5. Education & Languages
  let educationLevel = '';
  const eduFieldParts: string[] = [];

  const eduRank: Record<string, number> = {
    'Doktora': 5,
    'Yüksek lisans': 4,
    'Yüksek Lisans': 4,
    'Lisans': 3,
    'Ön lisans': 2,
    'Ön Lisans': 2,
    'Meslek yüksekokulu': 2,
    'Lise': 1,
    'İlköğretim': 0,
    'Diğer': 0,
  };

  const normalizeCanonicalEduLevel = (raw?: string): string => {
    const norm = (raw || '').toLowerCase();
    if (norm.includes('doktora') || norm.includes('phd')) return 'Doktora';
    if (norm.includes('yüksek') || norm.includes('master') || norm.includes('tezli') || norm.includes('tezsiz')) {
      return 'Yüksek lisans';
    }
    if (norm.includes('ön lisans') || norm.includes('myo') || norm.includes('meslek yüksek')) {
      return 'Ön lisans';
    }
    if (norm.includes('lisans') || norm.includes('bachelor') || norm.includes('fakülte')) {
      return 'Lisans';
    }
    if (norm.includes('lise')) return 'Lise';
    return 'Lisans';
  };

  let maxRank = -1;
  const eduList = Array.isArray(payload.education) && payload.education.length > 0 ? payload.education : [];

  for (const edu of eduList) {
    const canonicalLvl = normalizeCanonicalEduLevel(edu.level);
    const rank = eduRank[canonicalLvl] ?? 3;
    if (rank > maxRank) {
      maxRank = rank;
      educationLevel = canonicalLvl;
    }
    const schoolPart = edu.school ? ` - ${suggestTitleCaseTr(edu.school)}` : '';
    const fieldPart = edu.field ? suggestTitleCaseTr(edu.field) : '';
    if (fieldPart) {
      eduFieldParts.push(`${fieldPart} (${canonicalLvl}${schoolPart})`);
    } else if (edu.school) {
      eduFieldParts.push(`${canonicalLvl} - ${suggestTitleCaseTr(edu.school)}`);
    }
  }

  const mappedEducationList: Array<{ level: string; field?: string; school?: string; graduationYear?: number | null }> = eduList.map((edu) => ({
    level: normalizeCanonicalEduLevel(edu.level),
    field: edu.field ? suggestTitleCaseTr(edu.field) : undefined,
    school: edu.school ? suggestTitleCaseTr(edu.school) : undefined,
    graduationYear: edu.graduationYear ?? null,
  }));

  const educationField = eduFieldParts.length > 0
    ? eduFieldParts.join(' / ')
    : (eduList[0]?.field ? suggestTitleCaseTr(eduList[0].field) : '');

  const languages = (payload.languages || []).join(', ');
  const certificates = (payload.certificates || []).join(', ');
  const residenceCity = payload.locations?.[0] ? suggestTitleCaseTr(payload.locations[0]) : '';
  const residenceDistrict = payload.locations?.[1] ? suggestTitleCaseTr(payload.locations[1]) : '';

  const candidateHeadlineRole = payload.roles?.[0] ? matchCanonicalPosition(payload.roles[0]).canonical : '';
  const mostRecentRole = experiences[0]?.role ? matchCanonicalPosition(experiences[0].role).canonical : '';
  const mostRecentSector = experiences[0]?.sector || '';
  const resolvedRole = mostRecentRole || candidateHeadlineRole || matchedRoles[0] || (experiences[0]?.role ?? '');
  const roleInferredSector = inferSectorFromRole(resolvedRole);
  const resolvedSector =
    (roleInferredSector && roleInferredSector !== 'Satış' ? roleInferredSector : '') ||
    mostRecentSector ||
    roleInferredSector ||
    (matchedSectors.length > 0 ? matchedSectors[0] : '') ||
    '';

  return {
    primaryRole: normalizeCvText(resolvedRole),
    matchedRoles: matchedRoles.map((r) => normalizeCvText(r)),
    primarySector: normalizeCvText(resolvedSector),
    matchedSectors: matchedSectors.map((s) => normalizeCvText(s)),
    professionalSkills: [...new Set(professionalSkills.map((s) => normalizeCvText(s)))],
    technicalSkills: [...new Set(technicalSkills.map((s) => normalizeCvText(s)))],
    tools: [...new Set(tools.map((t) => normalizeCvText(t)))],
    educationLevel: normalizeCvText(educationLevel) || 'Lisans',
    educationField: normalizeCvText(educationField),
    educationList: mappedEducationList.map((edu) => ({
      ...edu,
      school: normalizeCvText(edu.school || ''),
      field: normalizeCvText(edu.field || ''),
      level: normalizeCvText(edu.level || ''),
    })),
    languages: normalizeCvText(languages),
    certificates: normalizeCvText(certificates),
    residenceCity: normalizeCvText(residenceCity),
    residenceDistrict: normalizeCvText(residenceDistrict),
    fullName: payload.fullName ? normalizeCvText(payload.fullName) : undefined,
    gender: payload.gender,
    birthDate: payload.birthDate,
    email: payload.email,
    phone: payload.phone,
    linkedin: payload.linkedin,
    website: payload.website,
    nationality: payload.nationality,
    address: normalizeCvText(payload.address || ''),
    experiences: experiences.map((exp) => ({
      ...exp,
      role: normalizeCvText(exp.role),
      sector: normalizeCvText(exp.sector),
      company: normalizeCvText(exp.company),
      responsibilities: normalizeCvText(exp.responsibilities),
      achievements: normalizeCvText(exp.achievements),
    })),
    summary: normalizeCvText(payload.summary || ''),
    ambiguousItems,
    canonicalConfidence: ambiguousItems.length === 0 ? 1.0 : 0.8,
    fieldResolutionStatus: {
      fullName: payload.fullName ? 'RESOLVED' : 'NOT_FOUND',
      primaryRole: resolvedRole ? (matchCanonicalPosition(resolvedRole).isAmbiguous ? 'AMBIGUOUS' : 'RESOLVED') : 'NOT_FOUND',
      primarySector: resolvedSector ? (matchCanonicalSector(resolvedSector).isAmbiguous ? 'AMBIGUOUS' : 'RESOLVED') : 'NOT_FOUND',
      residenceCity: residenceCity ? 'RESOLVED' : 'NOT_FOUND',
      experiences: experiences.length > 0 ? 'RESOLVED' : 'NOT_FOUND',
      educationList: mappedEducationList.length > 0 ? 'RESOLVED' : 'NOT_FOUND',
      skills: professionalSkills.length > 0 || technicalSkills.length > 0 ? 'RESOLVED' : 'NOT_FOUND',
    },
  };
}

function isTechnicalSkill(skill: string): boolean {
  const lower = skill.toLowerCase();
  const techKeywords = [
    'sql',
    'python',
    'java',
    'react',
    'node',
    'docker',
    'aws',
    'cloud',
    'api',
    'git',
    'html',
    'css',
    'c#',
    'c++',
    'linux',
    'kubernetes',
    'ci/cd',
    'typescript',
    'javascript',
    'angular',
    'vue',
    'php',
    'go',
    'rust',
    'kotlin',
    'swift',
    'mongodb',
    'postgresql',
    'redis',
    'graphql',
    'rest',
    'microservices',
    'cad',
    'sap',
    'crm',
    'erp',
    'excel',
    'power bi',
    'tableau',
    'salesforce',
    'hubspot',
    'postman',
    'jira',
    'figma',
    'slack',
    'pacs',
    'his',
    'dijital',
    'lead generation',
    'telemarketing',
    'inbound',
    'outbound',
  ];
  return techKeywords.some((k) => lower.includes(k));
}
