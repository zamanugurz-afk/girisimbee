import { describe, expect, it } from 'vitest';
import { parseCandidateListingCreate } from './candidate-listings';

describe('Candidate Listings Validation Schema', () => {
  const validBaseListing = {
    title: 'Kıdemli Yazılım Mimarı',
    shortDescription: '10 yıllık deneyimli yazılım mimarı ve teknik lider.',
    longDescription:
      'Kurumsal ölçekli projelerde mikroservis mimarileri, bulut altyapıları ve yüksek performanslı sistemler üzerine 10 yılı aşkın süredir liderlik yapıyorum.',
    city: 'İstanbul',
    primarySector: 'Bilişim / Yazılım',
    desiredRole: 'Yazılım Mimarı',
    experienceLevel: 'Yönetici',
    workType: 'Tam zamanlı',
    experiences: [
      {
        id: 'exp-1',
        sector: 'Bilişim / Yazılım',
        role: 'Yazılım Mimarı',
        company: 'Tech Corp',
        startMonth: 1,
        startYear: 2020,
        endMonth: 12,
        endYear: 2025,
        isCurrent: true,
        duration: '5 yıl',
        responsibilities: 'Mikroservis mimarisinin tasarlanması, bulut dönüşümünün yönetilmesi ve teknik ekibe liderlik edilmesi.',
      },
    ],
  };

  it('successfully parses candidate listing with 1000+ character professional skills', () => {
    // Generate 1500 character professional skills string
    const longSkills = 'Mikroservis Mimarisi, Kubernetes, Docker, Dağıtık Sistemler, '.repeat(25);
    expect(longSkills.length).toBeGreaterThan(1200);

    const result = parseCandidateListingCreate({
      ...validBaseListing,
      professionalSkills: longSkills,
      technicalSkills: 'TypeScript, Go, Rust, PostgreSQL, Redis, GraphQL, Kafka, AWS, GCP, CI/CD, Terraform, Linux',
      tools: 'VS Code, IntelliJ IDEA, Postman, Jira, GitHub Actions, Datadog, Prometheus, Grafana',
    });

    expect(result.professionalSkills).toBe(longSkills);
    expect(result.title).toBe('Kıdemli Yazılım Mimarı');
  });

  it('successfully parses candidate listing with 1000+ character leadership and tools', () => {
    const longLeadership = '15 kişilik mühendislik ekibinin yönetimi, sprint planlama, mentörlük ve performans değerlendirmeleri. '.repeat(15);
    const longTools = 'Jira, Confluence, Slack, Figma, VS Code, Git, Docker, Kubernetes, AWS Console, Datadog. '.repeat(20);

    expect(longLeadership.length).toBeGreaterThan(1000);
    expect(longTools.length).toBeGreaterThan(1000);

    const result = parseCandidateListingCreate({
      ...validBaseListing,
      leadershipExperience: longLeadership,
      tools: longTools,
    });

    expect(result.leadershipExperience).toBe(longLeadership);
    expect(result.tools).toBe(longTools);
  });

  it('provides friendly Turkish error message when a field exceeds max bounds', () => {
    // Exceed 4000 characters
    const ultraLongSkills = 'A'.repeat(4500);

    try {
      parseCandidateListingCreate({
        ...validBaseListing,
        professionalSkills: ultraLongSkills,
      });
      expect.fail('Should have thrown validation error');
    } catch (err: any) {
      expect(err.errors[0]?.message).toContain('Mesleki yetkinlikler en fazla 4000 karakter olabilir.');
    }
  });
});
