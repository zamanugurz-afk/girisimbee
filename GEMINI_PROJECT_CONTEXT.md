# Girisimbee — Kapsamlı Proje ve Mimari Dokümantasyonu (Gemini Context Guide)

Bu doküman, **Girisimbee** platformunun tüm mimarisini, veri tabanı şemasını, iş mantığını, klasör yapısını ve geliştirme kurallarını yapay zekâ (Gemini/LLM) modellerinin doğrudan anlayabileceği ve üzerine geliştirme yapabileceği formatta özetler.

---

## 1. Proje Genel Bakışı

- **Proje Adı:** Girisimbee
- **Slogan:** Fikirler Uçuşur, Fırsatlar Doğar.
- **Canlı Domain:** [https://www.girisimbee.com](https://www.girisimbee.com)
- **Amaç:** Türkiye girişimcilik ekosisteminde yatırımcıları, girişimcileri, ortak arayan kurucuları, kariyer adaylarını, işverenleri, bayilik (franchise) veren/alanları ve işletme devredenleri tek bir modern pazar yerinde güvenli ve gizlilik odaklı buluşturmak.

---

## 2. Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji / Kütüphane | Açıklama |
| :--- | :--- | :--- |
| **Framework** | Next.js 13+ (App Router) | Server Components, Client Components, Route Handlers, ISR (evalidate = 60) |
| **Dil** | TypeScript | Sıkı tip denetimi (strict: true), domain tipleri ve mapper katmanı |
| **Stil / UI** | Tailwind CSS + Radix UI / Lucide React | Modern dark/light tema, mikro etkileşimler, responsive grid sistemi |
| **Veritabanı & Auth** | Supabase (PostgreSQL 15) | Row-Level Security (RLS), Auth Service, Storage Buckets, Triggers |
| **Durum Yönetimi** | React Hooks + Context API | useAuth, useConversations, useListingDetail |
| **Dağıtım / CI** | Vercel (Edge Network) | Global CDN, Serverless Functions, Incremental Static Regeneration |

---

## 3. Ekosistem Modülleri ve Kategoriler

Girisimbee 6 ana dikeyde hizmet verir:

1. **Yatırım (yatirim / yatirim-bul & yatirim-yap)**:
   - yatirim-ariyorum: Erken ve büyüme aşaması girişimlerin yatırım arayışı.
   - yatirim-yapiyorum: Melek yatırımcı ve fonların yatırım kriterleri ve portföy ilgileri.
2. **Ortaklık & Girişim (ortaklik / ortak-bul)**:
   - Kurucu ortak (co-founder), teknik ortak (CTO), büyüme ortağı arayışları.
3. **Kariyer & İş Fırsatları (is / is-bul & ise-al)**:
   - is-bul (Aday Profili): Anonim mod, 01/02/03 aşamalı deneyim kartları, yetkinlik çipleri, eğitim ve sertifikalar.
   - ise-al (İşveren İlanı): Pozisyon başlığı, aranan kriterler, görev tanımları, teknoloji beklentileri ve başvuru sistemi.
4. **Franchise & Bayilik (ranchise / ayilik-al & ayilik-ver)**:
   - Bayilik veren markalar, yatırım bütçesi, şube sayısı, lokasyon ve franchise paketleri.
5. **İşletme Devri (isletme-devri / isletme-devret & isletme-devral)**:
   - Devren satılık kafe, restoran, otel, e-ticaret altyapısı ve işletmeler.
6. **Dijital & Yapay Zekâ Çözümleri (dijital-ai)**:
   - AI asistanları, SaaS ürünleri, mikro araçlar ve hazır yazılımlar.

---

## 4. Dizin ve Klasör Yapısı (Folder Architecture)

\\\	ext
project/
├── app/                                 # Next.js App Router
│   ├── (auth)/                          # Giriş, Kayıt, Şifre Sıfırlama
│   ├── api/                             # Backend API Route Handlers
│   │   ├── clean-and-seed/              # Canlı veri temizleme & 30 zengin ilan tohumlama
│   │   ├── clean-messages/              # Demo mesaj/konuşma temizleme
│   │   ├── conversations/               # Mesajlaşma oturumları API
│   │   ├── contact-requests/            # İletişim talepleri ve onay mekanizması
│   │   └── listings/                    # İlan sorgulama, filtreleme, oluşturma
│   ├── dashboard/                       # Kullanıcı & İlan Yönetim Paneli
│   ├── ilan/[id]/                       # İlan Detay Sayfası (ISR Revalidate 60)
│   ├── kategori/[slug]/                 # Kategori Liste ve Filtreleme Sayfası
│   ├── kesfet/                          # Keşfet & Arama Motoru
│   ├── mesajlarim/                      # Mesaj Kutusu ve Sohbet Ekranı
│   └── layout.tsx                       # Global Root Layout (Header, Footer, Providers)
├── features/                            # Feature-Driven Domain Katmanı
│   ├── authentication/                  # Auth Context, useAuth hook, login/register
│   ├── candidates/                      # Aday Profili, 01/02/03 Deneyim Kartları, Önizleme
│   ├── contact-requests/                # Anonim ilanlar için iletişim talebi yönetimi
│   ├── listings/                        # İlan Engine, Mappers, Repositories, Filters, DTOs
│   │   ├── components/                  # ListingCard, CategoryMarketplacePage, DetailView
│   │   ├── mappers/                     # listing-detail.mapper.ts (custom_fields -> UI DTO)
│   │   ├── mock/                        # curated-seed-listings.ts (30 zengin tohum şablonu)
│   │   └── repository/                  # Supabase listing repository ve sorgular
│   └── messaging/                       # Mesajlaşma repository, hooks, bubble UI
├── components/                          # Paylaşılan UI Bileşenleri
│   ├── ui/                              # Button, Dialog, Badge, Input, Card (Radix tabanlı)
│   └── girisimco/                       # Navbar, Footer, Hero, Marketplace bileşenleri
├── lib/                                 # Altyapı ve Yardımcı Araçlar
│   ├── supabase/                        # Browser, Server ve Service Role Supabase istemcileri
│   ├── persistence/                     # Container & Dependency Injection
│   └── utils.ts                         # cn (clsx + twMerge), formatlayıcılar
├── supabase/                            # Supabase SQL Migrations ve RLS Politikaları
└── scripts/                             # Bakım ve tohumlama scriptleri (.mjs)
\\\

---

## 5. Veritabanı Şeması & Temel Tablolar

### 1. marketplace_listings (Ana İlan Tablosu)
- id (UUID, Primary Key)
- slug (VARCHAR, Unique, URL dostu)
- owner_id (UUID -> uth.users)
- category_id (UUID -> marketplace_categories)
- listing_type_id (UUID -> marketplace_listing_types)
- module_key (candidates | employers | ounders | ranchise | NULL)
- 	itle (VARCHAR 200)
- short_description (VARCHAR 500)
- long_description (TEXT)
- status (published | draft | rchived | pending)
- location, city, district, industry, emote_policy
- nonymous_mode (BOOLEAN - Aday ilanlarında true)
- custom_fields (JSONB - Deneyimler, yetkinlikler, eğitim, maaş beklentisi vb.)
- iew_count, is_featured, is_urgent, created_at, deleted_at

### 2. marketplace_categories & marketplace_listing_types
- Kategoriler (yatirim, is, ortaklik, ranchise, dijital-ai, isletme-devri)
- İlan Tipleri (is-ariyorum, ise-aliyorum, yatirim-ariyorum, yatirim-yapiyorum, vb.)

### 3. Mesajlaşma & İletişim Tabloları
- marketplace_conversations: Sohbet oturumu (listing_id, status, last_message_at).
- marketplace_conversation_participants: Katılımcılar (conversation_id, user_id, last_read_at).
- marketplace_messages: Mesaj içerikleri (conversation_id, sender_id, content, created_at).
- marketplace_contact_requests: İletişim talepleri (listing_id, sender_user_id, status: pending/accepted/rejected).
- marketplace_job_applications: İş başvuruları.

---

## 6. Önemli Tasarım ve İş Mantığı Kuralları

1. **Kariyer Kart Yapısı (01/02/03 Stage Cards)**:
   - Deneyimler (experiences) numaralandırılmış solid renkli bloklar (#2563eb mavi / #059669 yeşil) ve sektör ikonuyla başlar.
   - Sorumluluk ve başarılar standart madde imi (bullet) yerine sola hizalı renkli nokta indikatörleriyle gösterilir.
   - Yetkinlikler sağ sütunda ChevronRight göstergeli interaktif hap kartlar olarak listelenir.
   - En altta 4 sütunlu özet şeridi yer alır: Kariyer Seviyesi, Çalışma Modeli, Lokasyon, Müsaitlik/Sektör.

2. **15 Saniye Yanıp Sönen (Pulse) Aksiyon Butonu**:
   - İlanın sol sütununun altında yer alan İLETİŞİM TALEBİ GÖNDER / POZİSYONA BAŞVUR / İLAN SAHİBİYLE İLETİŞİME GEÇ butonları sayfa açıldıktan sonra ilk 15 saniye boyunca nimate-pulse-gentle ring-2 efektiyle yanıp söner, ardından sabitlenir.

3. **Anonimlik ve Gizlilik**:
   - nonymous_mode: true olan aday ilanlarında soyisim ve doğrudan telefon gizlenir (Uğur Z.).
   - İletişim talebi kabul edildiğinde iletişim bilgileri ve site içi mesajlaşma kilidi açılır.

4. **Performans ve Edge CDN Önbellekleme**:
   - pp/ilan/[id]/page.tsx içinde export const revalidate = 60; tanımlıdır.
   - Giriş yapmamış anonim ziyaretçilerde gereksiz Supabase Auth API çağrısı yapılmaz, sayfalar Vercel CDN üzerinden 10-30 ms hızla servis edilir.

---

## 7. Tohumlama & Temizleme API'leri

- **Tüm İlanları Temizle ve 30 Zengin İlan Tohumla:**
  \GET /api/clean-and-seed?secret=girisimbee-clean-2026\
- **Tüm Mesaj ve Konuşmaları Temizle:**
  \GET /api/clean-messages?secret=girisimbee-clean-2026\

---

## 8. Yeni Özellik Geliştirirken İzlenecek Yol

1. **Tip Tanımı**: Yeni alanlar eatures/listings/types/ veya eatures/candidates/config/ altında tanımlanır.
2. **Mapper Güncelleme**: listing-detail.mapper.ts içinde custom_fields -> UI DTO dönüşümü eklenir.
3. **Bileşen Geliştirme**: İlgili modül eatures/<modul>/components/ altına eklenir, Tailwind CSS ile stilize edilir.
4. **Derleme & Doğrulama**: 
pm run build ile TypeScript ve Next.js derleme hataları sıfır olacak şekilde doğrulanır.
