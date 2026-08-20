import { describe, expect, it, vi } from 'vitest';
import * as openAiModule from '@/lib/openai/career-openai';
import { cvService } from '@/features/candidates/cv/cv.service';

describe('CV AI Call Count QA', () => {
  it('makes EXACTLY ONE AI call per CV upload, returning both structured data and summary in the same payload', async () => {
    // Spy on openaiJsonCompletion
    const openAiSpy = vi.spyOn(openAiModule, 'openaiJsonCompletion').mockResolvedValueOnce({
      model: 'gpt-4o-mini',
      json: {
        experiences: [
          {
            sector: 'Bilişim / Yazılım',
            role: 'Senior Software Developer',
            company: 'Tech A.Ş.',
            durationYears: 4,
            startYear: 2020,
            endYear: 2024,
            isCurrent: false,
            responsibilities: 'Mikroservis mimarisi geliştirme ve ekip liderliği.',
            achievements: 'Sistem yanıt süresini %35 iyileştirdi.',
          },
        ],
        roles: ['Senior Software Developer', 'Backend Developer'],
        sectors: ['Bilişim / Yazılım'],
        skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Sistem Mimarisi'],
        tools: ['Git', 'Docker', 'Kubernetes', 'Postman'],
        education: [
          {
            level: 'Lisans',
            field: 'Bilgisayar Mühendisliği',
            school: 'Ege Üniversitesi',
          },
        ],
        languages: ['İngilizce — İleri'],
        certificates: ['AWS Certified Solutions Architect'],
        locations: ['İzmir'],
        summary: 'İzmir lokasyonunda 4+ yıl backend ve mikroservis deneyimine sahip yazılım geliştirici.',
        ambiguousItems: [],
      },
    });

    const sampleCvText = `
Uğur Zaman
Senior Software Developer - İzmir
5 yıllık deneyimim boyunca çeşitli firmalarda mikroservis mimarileri, backend sistemleri geliştirdim.
Ege Üniversitesi Bilgisayar Mühendisliği mezunuyum.
Teknolojiler: Node.js, TypeScript, PostgreSQL, Docker.
    `.trim();

    const buffer = Buffer.from(sampleCvText, 'utf8');

    const result = await cvService.processCvBuffer({
      buffer,
      fileName: 'ugur-zaman-cv.txt',
      mimeType: 'text/plain',
    });

    // 1. Assert EXACTLY 1 AI call was made
    expect(openAiSpy).toHaveBeenCalledTimes(1);

    // 2. Assert metrics report 1 AI call
    expect(result.metrics.aiCallCount).toBe(1);

    // 3. Assert structured data extracted
    expect(result.formValues.role).toBe('Yazılım Geliştirici');
    expect(result.formValues.experiences).toHaveLength(1);
    expect(result.formValues.experiences?.[0].role).toBe('Yazılım Geliştirici');
    expect(result.formValues.technicalSkills?.toLowerCase()).toContain('typescript');
    expect(result.formValues.tools?.toLowerCase()).toContain('docker');

    // 4. Assert career summary was synthesized in the same response
    expect(result.summary).toContain('İzmir lokasyonunda 4+ yıl backend');
    expect(result.formValues.candidateTraits).toBe(result.summary);

    // Clean up
    openAiSpy.mockRestore();
  });
});
