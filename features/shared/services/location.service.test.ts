import { describe, expect, it } from 'vitest';
import {
  getStandardCityOptions,
  getStandardDistrictsForCity,
  sortCitiesForStandardPicker,
  GLOBAL_STANDARD_CITIES,
  STANDARD_ISTANBUL_ANADOLU_DISTRICTS,
  STANDARD_ISTANBUL_AVRUPA_DISTRICTS,
} from './location.service';

describe('LocationService — Global Location Standard for GirişimBee', () => {
  describe('1. Global City Sorting Standard', () => {
    it('places İstanbul Anadolu Yakası first and İstanbul Avrupa Yakası second', () => {
      const cities = getStandardCityOptions();
      expect(cities[0]).toBe('İstanbul Anadolu Yakası');
      expect(cities[1]).toBe('İstanbul Avrupa Yakası');
    });

    it('sorts the remaining 80 provinces in Turkish alphabetical order', () => {
      const cities = getStandardCityOptions();
      const otherCities = cities.slice(2);
      expect(otherCities.length).toBe(80);
      expect(otherCities[0]).toBe('Adana');
      expect(otherCities[1]).toBe('Adıyaman');
      expect(otherCities[2]).toBe('Afyonkarahisar');
      expect(otherCities[otherCities.length - 1]).toBe('Zonguldak');

      // Verify strict Turkish alphabetical collation
      for (let i = 0; i < otherCities.length - 1; i++) {
        expect(otherCities[i].localeCompare(otherCities[i + 1], 'tr-TR')).toBeLessThanOrEqual(0);
      }
    });

    it('sorts arbitrary lists with sortCitiesForStandardPicker accurately', () => {
      const mixed = ['İzmir', 'İstanbul Avrupa Yakası', 'Adana', 'İstanbul Anadolu Yakası', 'Bursa'];
      const sorted = sortCitiesForStandardPicker(mixed);
      expect(sorted).toEqual([
        'İstanbul Anadolu Yakası',
        'İstanbul Avrupa Yakası',
        'Adana',
        'Bursa',
        'İzmir',
      ]);
    });
  });

  describe('2. Global District Standard', () => {
    it('returns 14 Anadolu Yakası districts sorted in Turkish alphabetical order', () => {
      const districts = getStandardDistrictsForCity('İstanbul Anadolu Yakası');
      expect(districts.length).toBe(14);
      expect(districts).toEqual([
        'Adalar',
        'Ataşehir',
        'Beykoz',
        'Çekmeköy',
        'Kadıköy',
        'Kartal',
        'Maltepe',
        'Pendik',
        'Sancaktepe',
        'Sultanbeyli',
        'Şile',
        'Tuzla',
        'Ümraniye',
        'Üsküdar',
      ]);
    });

    it('returns 25 Avrupa Yakası districts sorted in Turkish alphabetical order', () => {
      const districts = getStandardDistrictsForCity('İstanbul Avrupa Yakası');
      expect(districts.length).toBe(25);
      expect(districts).toEqual([
        'Arnavutköy',
        'Avcılar',
        'Bağcılar',
        'Bahçelievler',
        'Bakırköy',
        'Başakşehir',
        'Bayrampaşa',
        'Beşiktaş',
        'Beylikdüzü',
        'Beyoğlu',
        'Büyükçekmece',
        'Çatalca',
        'Esenler',
        'Esenyurt',
        'Eyüpsultan',
        'Fatih',
        'Gaziosmanpaşa',
        'Güngören',
        'Kağıthane',
        'Küçükçekmece',
        'Sarıyer',
        'Silivri',
        'Sultangazi',
        'Şişli',
        'Zeytinburnu',
      ]);
    });

    it('returns alphabetically sorted districts for other cities (e.g. Ankara, İzmir)', () => {
      const ankaraDistricts = getStandardDistrictsForCity('Ankara');
      expect(ankaraDistricts.length).toBeGreaterThan(10);
      expect(ankaraDistricts[0]).toBe('Akyurt');
      expect(ankaraDistricts).toContain('Çankaya');
      expect(ankaraDistricts).toContain('Yenimahalle');

      // Verify sorted order
      for (let i = 0; i < ankaraDistricts.length - 1; i++) {
        expect(ankaraDistricts[i].localeCompare(ankaraDistricts[i + 1], 'tr-TR')).toBeLessThanOrEqual(0);
      }
    });

    it('returns empty array when city is null, undefined, or empty string', () => {
      expect(getStandardDistrictsForCity(null)).toEqual([]);
      expect(getStandardDistrictsForCity(undefined)).toEqual([]);
      expect(getStandardDistrictsForCity('')).toEqual([]);
      expect(getStandardDistrictsForCity('   ')).toEqual([]);
    });
  });
});
