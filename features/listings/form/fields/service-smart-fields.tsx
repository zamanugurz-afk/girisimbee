'use client';

import React, { useState, useMemo } from 'react';
import { Plus, X, Check, MapPin, Wrench, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';

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
 * 1. Verilen Hizmet Kalemleri ve Uzmanlıklar Akıllı Seçici
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

  return (
    <div className="space-y-3">
      {/* Akıllı Öneri Hapları */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/20">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{serviceCategory ? `"${serviceCategory}" için Önerilen Hizmetler` : 'Önerilen Hizmet Kalemleri'}</span>
          </span>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            (Tıklayarak ekleyin)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presetOptions.map((opt) => {
            const isSelected = selectedItems.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleItem(opt)}
                disabled={disabled}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150',
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-indigo-100/80 border border-indigo-200/80 dark:bg-zinc-900 dark:text-slate-200 dark:border-indigo-900',
                )}
              >
                {isSelected ? <Check className="h-3 w-3 shrink-0" /> : <Plus className="h-3 w-3 shrink-0 opacity-60" />}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Özel Hizmet Ekleme Girişi */}
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
          placeholder="Listede olmayan başka bir uzmanlık / hizmet ekleyin..."
          className="h-10 text-xs sm:text-sm"
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={() => handleAddCustom()}
          disabled={disabled || !customInput.trim()}
          variant="outline"
          size="sm"
          className="h-10 shrink-0 font-medium text-xs border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-indigo-900"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>Ekle</span>
        </Button>
      </div>

      {/* Seçilen Kalemler Rozetleri */}
      {selectedItems.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Seçilen Hizmet Kalemleri ({selectedItems.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-900 border border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-800"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => toggleItem(item)}
                  disabled={disabled}
                  className="rounded-full hover:bg-indigo-200/60 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 2. Hizmet Verilen İlçeler Akıllı Seçici
 */
export function ServiceDistrictsSmartPicker({
  city,
  value,
  onChange,
  disabled,
}: {
  city?: string | null;
  value: string[] | string;
  onChange: (districts: string[]) => void;
  disabled?: boolean;
}) {
  const [customDistrict, setCustomDistrict] = useState('');

  const selectedDistricts = useMemo(() => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value]);

  const availableDistricts = useMemo(() => {
    const cityName = city || 'İstanbul';
    return getDistrictsForCity(cityName);
  }, [city]);

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
    if (selectedDistricts.length === availableDistricts.length) {
      onChange([]);
    } else {
      onChange([...availableDistricts]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customDistrict.trim();
    if (!trimmed || disabled) return;
    if (!selectedDistricts.includes(trimmed)) {
      onChange([...selectedDistricts, trimmed]);
    }
    setCustomDistrict('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <MapPin className="h-3.5 w-3.5 text-indigo-600" />
          <span>{city || 'İstanbul'} İlçeleri ({availableDistricts.length} İlçe):</span>
        </span>
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          {selectedDistricts.length === availableDistricts.length ? 'Seçimi Temizle' : 'Tüm İlçeleri Seç'}
        </button>
      </div>

      {/* İlçe Çipleri Grid */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 scrollbar-thin dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex flex-wrap gap-1.5">
          {availableDistricts.map((district) => {
            const isSelected = selectedDistricts.includes(district);
            return (
              <button
                key={district}
                type="button"
                onClick={() => toggleDistrict(district)}
                disabled={disabled}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:border-indigo-300 dark:bg-zinc-800 dark:text-slate-300 dark:border-zinc-700',
                )}
              >
                {isSelected && <Check className="h-3 w-3 shrink-0" />}
                <span>{district}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ekstra İlçe / Bölge Ekleme */}
      <div className="flex items-center gap-2">
        <Input
          value={customDistrict}
          onChange={(e) => setCustomDistrict(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustom();
            }
          }}
          placeholder="Listede olmayan ilçe, semt veya çevre il ekleyin..."
          className="h-10 text-xs sm:text-sm"
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={handleAddCustom}
          disabled={disabled || !customDistrict.trim()}
          variant="outline"
          size="sm"
          className="h-10 shrink-0 font-medium text-xs border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-indigo-900"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>Ekle</span>
        </Button>
      </div>

      {/* Seçim Sayısı */}
      <div className="text-[11px] font-medium text-slate-500">
        Seçilen bölge sayısı: <strong className="text-indigo-600 dark:text-indigo-400">{selectedDistricts.length}</strong>
      </div>
    </div>
  );
}
