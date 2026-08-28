'use client';

import React, { useState, useMemo } from 'react';
import { Plus, X, MapPin, Sparkles, Check, CheckSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import {
  ISTANBUL_ANADOLU_DISTRICTS,
  ISTANBUL_AVRUPA_DISTRICTS,
  getDistrictsForCity,
} from '@/features/shared/constants/turkish-districts';

export const HIZMET_PRESET_SERVICES: Record<string, string[]> = {
  'Elektrik ve Tesisat': [
    'Termal Kamera ile Kaçak Su Tespiti',
    'Robotlu Pimaş ve Gider Tıkanıklığı Açma',
    'Petek ve Radyatör Temizliği',
    'Klozet, Batarya ve Musluk Montajı',
    'Komple Daire Su Tesisatı Yenileme',
    'Elektrik Sigorta ve Pano Arızası',
    'Aydınlatma, Avize ve Led Montajı',
    'Topraklama ve Kaçak Akım Rölesi',
    'Kablo Çekimi ve Priz Yenileme',
  ],
  'Ev ve Ofis Temizliği': [
    'Taşınma Öncesi Boş Ev Temizliği',
    'İnşaat ve Tadilat Sonrası Temizlik',
    'Düzenli Ofis ve İşyeri Temizliği',
    'Buharlı Koltuk ve Yatak Yıkama',
    'Cam ve Dış Cephe Temizliği',
    'Villa ve Rezidans Temizliği',
    'Detaylı Mutfak ve Banyo Dezenfeksiyonu',
    'Gündelik Ev Temizliği',
  ],
  'Çilingir ve Kilit': [
    'Hasarsız Çelik Kapı Açma',
    'Tuzaklı ve Alarmlı Kilit Montajı',
    'Oto Kapısı ve Kontak Açma',
    'Kasa Kilidi Açma ve Şifreleme',
    'Barel ve Göbek Değişimi',
    'Manyetik ve Kartlı Geçiş Sistemleri',
    'Hidrolik Kapı Yayı Montajı',
    'Pencere Emniyet Kilidi',
  ],
  'Nakliye ve Taşımacılık': [
    'Asansörlü Evden Eve Nakliyat',
    'Marangozlu Mobilya Demontaj ve Kurulum',
    'Balonlu Patpat ile Mobilya Ambalajlama',
    'Şehirler Arası Sigortalı Nakliyat',
    'Ofis, Büro ve İşyeri Taşıma',
    'Parça Eşya ve Kamyonet Hizmeti',
    'Piyano ve Ağır Kasa Taşıma',
    'Eşya Depolama Hizmeti',
  ],
  'Boya, Badana ve Tadilat': [
    '1 Günde Temiz Boya Badana',
    'Alçı Sıva, Kartonpiyer ve Gergi Tavan',
    'Banyo ve Mutfak Seramik Yenileme',
    'İç ve Dış Cephe Mantolama',
    'Laminat Parke Döşeme ve Süpürgelik',
    'Kapı Boyama ve Ahşap Vernikleme',
    'Duvar Kağıdı Uygulama ve Sökme',
    'Komple Daire Anahtar Teslim Tadilat',
  ],
  'Beyaz Eşya ve Kombi Servisi': [
    'Kombi Bakım, Arıza ve Petek Temizliği',
    'Klima Montaj, Demontaj ve Gaz Dolumu',
    'Çamaşır ve Bulaşık Makinesi Servisi',
    'Buzdolabı Tamiri ve Motor Değişimi',
    'Termosifon ve Şofben Montajı',
    'Ocak ve Fırın Dönüşümü / Montajı',
  ],
  'Marangoz ve Mobilya Montajı': [
    'Mobilya Kurulum ve Montaj Hizmeti',
    'Özel Ölçü Mutfak ve Ray Dolap Yapımı',
    'Ahşap Kapı ve Pencere Tamiri',
    'Masa, Sandalye ve Ahşap Restorasyonu',
    'Giyinme Odası ve Vestiyer İmalatı',
    'Kırık Ayak, Ray ve Menteşe Değişimi',
  ],
  'Halı ve Koltuk Yıkama': [
    'Yerinde Buharlı Koltuk Yıkama',
    'Fabrikada Otomatik Halı Yıkama',
    'Yatak ve Baza Dezenfeksiyonu',
    'Stor ve Zebra Perde Yıkama',
    'Araç Koltuk Yıkama ve Detaylı Temizlik',
    'Leke Çıkarma ve Antibakteriyel Bakım',
  ],
  'Oto Yıkama ve Detailing': [
    'Detaylı İç Kuaför ve Ozon Temizliği',
    'Pasta Cila ve Boya Düzeltme',
    'Seramik Kaplama ve Boya Koruma',
    'Motor Temizliği ve Koruma',
    'Far Temizliği ve Parlatma',
    'Cam Filmi ve PPF Kaplama',
  ],
  'Bahçe Bakımı ve Peyzaj': [
    'Çim Biçme, Havalandırma ve Gübreleme',
    'Ağaç Budama, Şekil Verme ve İlaçlama',
    'Otomatik Sulama Sistemi Kurulumu',
    'Bahçe Düzenleme ve Peyzaj Projesi',
    'Mevsimlik Çiçeklendirme ve Ağaç Dikimi',
  ],
  'İlaçlama ve Dezenfeksiyon': [
    'Hamamböceği ve Kalorifer Böceği İlaçlama',
    'Pire, Tahtakurusu ve Kene İlaçlama',
    'Fare ve Kemirgen Kontrolü',
    'Ev, Ofis ve Depo İlaçlama',
    'Kokusuz ve Jel İlaçlama Uygulaması',
    'Sağlık Bakanlığı Onaylı Dezenfeksiyon',
  ],
  'Cam Balkon ve PVC Doğrama': [
    'Katlanır ve Sürgülü Cam Balkon Montajı',
    'PVC Pencere ve Kapı İmalatı / Tamiri',
    'Sineklik İmalatı ve Montajı',
    'Giyotin Cam ve Otomatik Tente',
    'Kırık Cam ve İspanyolet Değişimi',
  ],
  'Demir Doğrama ve Kepenk': [
    'Otomatik Kepenk ve Garaj Kapısı',
    'Demir Parmaklık ve Korkuluk İmalatı',
    'Yangın Merdiveni ve Çelik Çatı',
    'Sürgülü Bahçe Kapısı ve Motoru',
    'Kaynak ve Demir Tamirat İşleri',
  ],
};

/**
 * 1. Verilen Hizmet Kalemleri ve Uzmanlıklar — Kutucuklu Model (Image 4)
 */
export function ServiceItemsSmartPicker({
  serviceCategory,
  value,
  onChange,
  disabled,
}: {
  serviceCategory?: string;
  value: string[] | string;
  onChange: (items: string[]) => void;
  disabled?: boolean;
}) {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const selectedItems = useMemo(() => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value]);

  const presetOptions = useMemo(() => {
    if (!serviceCategory) {
      return HIZMET_PRESET_SERVICES['Elektrik ve Tesisat'] || [];
    }
    return HIZMET_PRESET_SERVICES[serviceCategory] || HIZMET_PRESET_SERVICES['Elektrik ve Tesisat'] || [];
  }, [serviceCategory]);

  const customItems = useMemo(() => {
    return selectedItems.filter((item) => !presetOptions.includes(item));
  }, [selectedItems, presetOptions]);

  const toggleItem = (item: string) => {
    if (disabled) return;
    if (selectedItems.includes(item)) {
      onChange(selectedItems.filter((i) => i !== item));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed || disabled) return;
    if (!selectedItems.includes(trimmed)) {
      onChange([...selectedItems, trimmed]);
    }
    setCustomInput('');
  };

  const removeCustomItem = (item: string) => {
    if (disabled) return;
    onChange(selectedItems.filter((i) => i !== item));
  };

  return (
    <div className="space-y-3">
      {/* Kutucuklu Seçenekler Grid (Image 4 Yapısı) */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {presetOptions.map((opt) => {
          const isChecked = selectedItems.includes(opt);
          return (
            <label
              key={opt}
              htmlFor={`service-opt-${opt}`}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-xs sm:text-sm transition-all select-none',
                isChecked
                  ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200 shadow-2xs'
                  : 'border-slate-200/90 bg-card text-slate-700 hover:border-indigo-300 hover:bg-slate-50/50 dark:border-zinc-800 dark:text-slate-300 dark:hover:border-zinc-700',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <Checkbox
                id={`service-opt-${opt}`}
                checked={isChecked}
                onCheckedChange={() => toggleItem(opt)}
                disabled={disabled}
                className="mt-0.5 shrink-0 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <span className="leading-snug">{opt}</span>
            </label>
          );
        })}

        {/* Diğer / Kendim Gireceğim Kutucuğu */}
        <label
          htmlFor="service-opt-other"
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-xs sm:text-sm transition-all select-none',
            showCustomInput || customItems.length > 0
              ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200'
              : 'border-slate-200/90 bg-card text-slate-700 hover:border-indigo-300 hover:bg-slate-50/50 dark:border-zinc-800 dark:text-slate-300',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <Checkbox
            id="service-opt-other"
            checked={showCustomInput || customItems.length > 0}
            onCheckedChange={(checked) => setShowCustomInput(checked === true)}
            disabled={disabled}
            className="mt-0.5 shrink-0 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
          />
          <span className="leading-snug">Diğer / Kendim gireceğim</span>
        </label>
      </div>

      {/* Kendim Gireceğim Alanı Açıldığında */}
      {(showCustomInput || customItems.length > 0) && (
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3.5 space-y-3 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="flex items-center gap-2">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              placeholder="Örn: Su Sayaç Değişimi veya Korniş Montajı..."
              className="h-10 text-xs sm:text-sm bg-white dark:bg-zinc-900"
              disabled={disabled}
            />
            <Button
              type="button"
              onClick={() => handleAddCustom()}
              disabled={disabled || !customInput.trim()}
              size="sm"
              className="h-10 bg-indigo-600 text-white hover:bg-indigo-700 shrink-0 font-medium px-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Ekle</span>
            </Button>
          </div>

          {/* Eklenen Özel Kalemler */}
          {customItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {customItems.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-950 border border-indigo-300 dark:bg-zinc-900 dark:text-indigo-200 dark:border-indigo-800 shadow-2xs"
                >
                  <Check className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomItem(item)}
                    disabled={disabled}
                    className="ml-1 rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seçim Durumu Sayacı */}
      <div className="text-[12px] font-medium text-slate-500 flex items-center justify-between">
        <span>Seçilen Hizmet Kalemi: <strong className="text-indigo-600 dark:text-indigo-400">{selectedItems.length}</strong></span>
        {selectedItems.length === 0 && (
          <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">Lütfen en az bir hizmet seçin</span>
        )}
      </div>
    </div>
  );
}

/**
 * Sıralı İl Listesi:
 * 1. İstanbul (Anadolu)
 * 2. İstanbul (Avrupa)
 * 3. Ankara, İzmir, Bursa, Antalya, Adana (En önemli 5 büyük şehir)
 * 4. Ardından A-Z diğer tüm iller
 */
const TOP_PRIORITY_CITIES = [
  'İstanbul (Anadolu)',
  'İstanbul (Avrupa)',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
] as const;

const REMAINING_TURKISH_CITIES = TURKISH_CITIES
  .filter((c) => !['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'].includes(c))
  .sort((a, b) => a.localeCompare(b, 'tr-TR'));

export const ORDERED_SERVICE_CITIES = [
  ...TOP_PRIORITY_CITIES,
  ...REMAINING_TURKISH_CITIES,
] as const;

/**
 * 2. Hizmet Verilen İl ve İlçeler — Liste ve Kutucuklu Seçim Modeli
 * İl: Tek seçim (Single Select)
 * İlçe: Liste içinden arama ve kutucuklarla çoklu seçim
 */
export function ServiceDistrictsSmartPicker({
  city,
  value,
  onChange,
  onCityChange,
  disabled,
}: {
  city?: string | null;
  value: string[] | string;
  onChange: (districts: string[]) => void;
  onCityChange?: (city: string) => void;
  disabled?: boolean;
}) {
  const [districtSearch, setDistrictSearch] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [showCustomDistrict, setShowCustomDistrict] = useState(false);

  // İl varsayılanı İstanbul (Anadolu)
  const currentCity = useMemo(() => {
    if (!city) return 'İstanbul (Anadolu)';
    if (city === 'İstanbul' || city === 'İstanbul Anadolu Yakası' || city === 'İstanbul (Anadolu Yakası)') {
      return 'İstanbul (Anadolu)';
    }
    if (city === 'İstanbul Avrupa Yakası' || city === 'İstanbul (Avrupa Yakası)') {
      return 'İstanbul (Avrupa)';
    }
    return city;
  }, [city]);

  const selectedDistricts = useMemo(() => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value]);

  // Seçilen ile ait resmi ilçe listesi
  const availableDistricts = useMemo(() => {
    if (currentCity === 'İstanbul (Anadolu)') {
      return [...ISTANBUL_ANADOLU_DISTRICTS];
    }
    if (currentCity === 'İstanbul (Avrupa)') {
      return [...ISTANBUL_AVRUPA_DISTRICTS];
    }
    const raw = getDistrictsForCity(currentCity);
    return raw.filter((d) => d !== 'Diğer');
  }, [currentCity]);

  // Arama filtreli ilçe listesi
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return availableDistricts;
    const query = districtSearch.toLocaleLowerCase('tr-TR').trim();
    return availableDistricts.filter((d) =>
      d.toLocaleLowerCase('tr-TR').includes(query)
    );
  }, [availableDistricts, districtSearch]);

  const customDistricts = useMemo(() => {
    return selectedDistricts.filter((d) => !availableDistricts.includes(d));
  }, [selectedDistricts, availableDistricts]);

  const handleCitySelect = (newCity: string) => {
    if (disabled) return;
    if (onCityChange) {
      onCityChange(newCity);
    }
    setDistrictSearch('');
    // İl değiştiğinde önceki ilin ilçelerini temizleyip yeni ilin ilçelerine hazırla
    onChange([]);
  };

  const toggleDistrict = (district: string) => {
    if (disabled) return;
    if (selectedDistricts.includes(district)) {
      onChange(selectedDistricts.filter((d) => d !== district));
    } else {
      onChange([...selectedDistricts, district]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    if (selectedDistricts.length >= availableDistricts.length) {
      onChange([]);
    } else {
      onChange([...availableDistricts]);
    }
  };

  const handleAddCustomDistrict = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDistrict.trim();
    if (!trimmed || disabled) return;
    if (!selectedDistricts.includes(trimmed)) {
      onChange([...selectedDistricts, trimmed]);
    }
    setCustomDistrict('');
  };

  const removeDistrict = (district: string) => {
    if (disabled) return;
    onChange(selectedDistricts.filter((d) => d !== district));
  };

  return (
    <div className="space-y-4">
      {/* 1. İl Seçimi (Tek Seçim Dropdown) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Hizmet Verilen İl / Bölge <span className="text-destructive">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground">Tek seçim</span>
        </div>

        <Select
          value={currentCity}
          onValueChange={handleCitySelect}
          disabled={disabled}
        >
          <SelectTrigger className="h-11 rounded-xl border border-input bg-card px-3.5 text-sm font-medium">
            <SelectValue placeholder="İl seçin" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {/* Öncelikli İller Grubu */}
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Büyük Şehirler ve Yakalar
            </div>
            {TOP_PRIORITY_CITIES.map((c) => (
              <SelectItem key={c} value={c} className="font-semibold text-slate-900 dark:text-slate-100">
                {c}
              </SelectItem>
            ))}

            <div className="my-1 border-t border-border/60" />

            {/* A-Z Diğer İller */}
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Diğer İller (A-Z)
            </div>
            {REMAINING_TURKISH_CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. İlçe Seçimi (Liste ve Kutucuklu Seçim Yapısı) */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-indigo-600" />
            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {currentCity} İlçeleri ({availableDistricts.length} İlçe):
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={disabled}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              {selectedDistricts.length >= availableDistricts.length ? 'Seçimi Temizle' : 'Tüm İlçeleri Seç'}
            </button>
          </div>
        </div>

        {/* Liste Kutusu (Arama + Scroll Edilebilir Temiz Liste) */}
        <div className="rounded-xl border border-slate-200/90 bg-white dark:border-zinc-800 dark:bg-card shadow-xs overflow-hidden">
          {/* Liste İçi Arama Çubuğu */}
          <div className="border-b border-slate-100 p-2.5 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
            <Input
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
              placeholder="🔍 İlçe ara... (Örn: Kadıköy, Beşiktaş)"
              className="h-9 text-xs sm:text-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
              disabled={disabled}
            />
          </div>

          {/* Dikey Liste Satırları */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 scrollbar-thin">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => {
                const isChecked = selectedDistricts.includes(district);
                return (
                  <label
                    key={district}
                    htmlFor={`dist-item-${district}`}
                    className={cn(
                      'flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm transition-colors select-none',
                      isChecked
                        ? 'bg-indigo-50/80 font-semibold text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-200 border-l-3 border-l-indigo-600'
                        : 'hover:bg-slate-50 text-slate-700 dark:hover:bg-zinc-800/60 dark:text-slate-300',
                      disabled && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        id={`dist-item-${district}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleDistrict(district)}
                        disabled={disabled}
                        className="shrink-0 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <span className="truncate">{district}</span>
                    </div>
                    {isChecked && (
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                    )}
                  </label>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Aradığınız ilçe listede bulunamadı. Aşağıdan özel bölge olarak ekleyebilirsiniz.
              </div>
            )}

            {/* Diğer / İlave Bölge Satırı */}
            <label
              htmlFor="dist-item-other"
              className={cn(
                'flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm transition-colors select-none border-t border-dashed border-indigo-200 dark:border-indigo-900/60',
                showCustomDistrict || customDistricts.length > 0
                  ? 'bg-indigo-50/80 font-semibold text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-200 border-l-3 border-l-indigo-600'
                  : 'hover:bg-slate-50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/30',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id="dist-item-other"
                  checked={showCustomDistrict || customDistricts.length > 0}
                  onCheckedChange={(checked) => setShowCustomDistrict(checked === true)}
                  disabled={disabled}
                  className="shrink-0 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <span className="font-medium">+ Diğer / İlave Semt Ekle</span>
              </div>
            </label>
          </div>
        </div>

        {/* İlave Bölge Ekleme Girişi */}
        {(showCustomDistrict || customDistricts.length > 0) && (
          <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3 space-y-2.5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
            <div className="flex items-center gap-2">
              <Input
                value={customDistrict}
                onChange={(e) => setCustomDistrict(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomDistrict();
                  }
                }}
                placeholder="Örn: Moda, Bostancı, Kızılay veya çevre semt adı..."
                className="h-10 text-xs sm:text-sm bg-white dark:bg-zinc-900"
                disabled={disabled}
              />
              <Button
                type="button"
                onClick={() => handleAddCustomDistrict()}
                disabled={disabled || !customDistrict.trim()}
                size="sm"
                className="h-10 bg-indigo-600 text-white hover:bg-indigo-700 shrink-0 font-medium px-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Ekle</span>
              </Button>
            </div>
          </div>
        )}

        {/* Seçilen İlçeler Rozet Listesi (Chips) */}
        {selectedDistricts.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-slate-500">
              Seçilen Bölgeler ({selectedDistricts.length}):
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/40 scrollbar-thin">
              {selectedDistricts.map((district) => (
                <Badge
                  key={district}
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-950 border border-indigo-200 dark:bg-zinc-900 dark:text-indigo-200 dark:border-indigo-800 shadow-2xs"
                >
                  <span>{district}</span>
                  <button
                    type="button"
                    onClick={() => removeDistrict(district)}
                    disabled={disabled}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Seçilen İlçe Sayısı ve Durum */}
        <div className="flex items-center justify-between text-[12px] font-medium text-slate-500 pt-0.5">
          <span>Seçilen İlçe Sayısı: <strong className="text-indigo-600 dark:text-indigo-400">{selectedDistricts.length}</strong></span>
          {selectedDistricts.length === 0 && (
            <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">Lütfen en az bir ilçe seçin</span>
          )}
        </div>
      </div>
    </div>
  );
}
