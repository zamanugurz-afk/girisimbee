import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/career/cv/analyze/route';
import { UGUR_ZAMAN_CV_TEXT } from '@/features/candidates/cv/cv-real-world-ugur-zaman.test';

describe('POST /api/career/cv/analyze Server Route Integration Test', () => {
  it('analyzes Uğur Zaman CV via JSON payload and returns exact canonical values with 0 data corruption', async () => {
    const base64Content = Buffer.from(UGUR_ZAMAN_CV_TEXT, 'utf-8').toString('base64');
    const req = new NextRequest('http://localhost:3000/api/career/cv/analyze', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fileContent: base64Content,
        fileName: 'CV - UĞUR ZAMAN (4).pdf',
        mimeType: 'application/pdf',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.draft).toBeDefined();

    const fv = json.draft.formValues;

    // 1. Full name must be 'Uğur Zaman', never 'Eğitim'
    expect(fv.fullName).toBe('Uğur Zaman');
    expect(fv.fullName).not.toBe('Eğitim');

    // 2. Primary sector must be 'Çağrı merkezi', never 'Kamu / Belediye'
    expect(fv.primarySector).toBe('Çağrı merkezi');
    expect(fv.primarySector).not.toBe('Kamu / Belediye');

    // 3. Desired role must be 'Çağrı Merkezi Operasyon Müdürü', never 'Uzman'
    expect(fv.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(fv.desiredRole).not.toBe('Uzman');

    // 4. Experience level
    expect(fv.experienceLevel).toBe('Yönetici');

    // 5. Locations
    expect(fv.residenceCity).toBe('İstanbul');
    expect(fv.residenceDistrict).toBe('Maltepe');

    // 6. Experience count: must be 6, never 11
    expect(fv.experiences).toHaveLength(6);

    // 7. Education count: must be 2
    expect(fv.educationHistory).toHaveLength(2);

    // 8. Skills: professional skills list must be clean (6 skills), never 64
    expect(fv.professionalSkillsList.length).toBeLessThanOrEqual(10);
    expect(fv.professionalSkillsList.length).toBeGreaterThanOrEqual(6);
  });
});
