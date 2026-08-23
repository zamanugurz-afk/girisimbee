import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

function computePercentiles(durations: number[]) {
  const sorted = [...durations].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const mean = durations.reduce((acc, d) => acc + d, 0) / durations.length;
  const max = sorted[sorted.length - 1];
  const min = sorted[0];
  return { min, mean, p50, p90, p95, p99, max };
}

describe('CV Extraction Engine 12.0 — Latency & High-Throughput Performance Suite', () => {
  const smallCv = `Ali Koç\nali@tech.com\nİstanbul\nYazılım Geliştirici\n\nDENEYİM\nTech A.Ş. - Geliştirici (2021 - 2024)`;

  const mediumCv = `Burcu Aras\nburcu@finance.com | 0532 999 88 77 | Ankara / Çankaya\nFinansal Kontrolör\n\nÖZET\n8 yıllık bütçe planlama, mali raporlama ve IFRS tecrübesi.\n\nİŞ DENEYİMİ\nMAN Türkiye - Kıdemli Mali Kontrolör (2020 - 2024)\n• Bütçe ve fiili maliyet analizleri\n• ERP entegrasyonu ve nakit akış yönetimi\n\nAkbank - Bütçe Uzmanı (2017 - 2020)\n• Şube bütçe denetimleri\n\nEĞİTİM\nBilkent Üniversitesi - İktisat (Lisans) - 2016\n\nBECERİLER\nIFRS, SAP FI/CO, Excel, Bütçe Planlama, Finansal Modelleme`;

  const largeCv = `Cengizhan Dağ\ncengizhan@enterprise.com | +90 532 111 22 33 | İzmir / Konak\nKıdemli Bulut ve DevOps Mimarı\n\nÖZET\n14 yıllık büyük ölçekli kurumsal altyapı, Kubernetes küme yönetimi, AWS multi-region dağıtım ve DevSecOps mimarisi tecrübesi.\n\nİŞ DENEYİMİ\nTurkcell - Baş DevOps Mimarı (2020 - 2024)\n• 500+ mikroservisin Kubernetes üzerinde multi-cloud mimarisine taşınması\n• Terraform ve ArgoCD ile GitOps süreçlerinin sıfırdan inşası\n• FinOps optimizasyonu ile bulut maliyetlerinde %35 tasarruf sağlanması\n\nVodafone - Kıdemli Bulut Mühendisi (2016 - 2020)\n• AWS üzerinde yüksek erişilebilirlikli telekom altyapılarının yönetimi\n• CI/CD pipeline otomasyonu ve zero-downtime deployment\n\nEricsson - Sistem Yöneticisi (2012 - 2016)\n• Linux sunucu parkı yönetimi, network güvenliği ve SAN storage mimarisi\n\nEĞİTİM\nEge Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2012\nİzmir Yüksek Teknoloji Enstitüsü - Siber Güvenlik (Yüksek Lisans) - 2015\n\nSERTİFİKALAR\nAWS Certified Solutions Architect - Professional (2023)\nCertified Kubernetes Administrator (CKA) (2022)\n\nBECERİLER & ARAÇLAR\nKubernetes, Docker, Terraform, AWS, GCP, ArgoCD, Helm, Prometheus, Grafana, Python, Go, Linux, Bash, CI/CD, Istio, Vault`;

  it('Performance 1: 100 Small CVs throughput benchmark', () => {
    const latencies: number[] = [];
    for (let i = 0; i < 100; i++) {
      const t0 = performance.now();
      const det = extractDeterministicCv(smallCv);
      mapCvToCanonicalTaxonomy(det);
      latencies.push(performance.now() - t0);
    }

    const stats = computePercentiles(latencies);
    expect(stats.p95).toBeLessThan(600);
    expect(stats.p99).toBeLessThan(800);
  });

  it('Performance 2: 100 Medium CVs throughput benchmark', () => {
    const latencies: number[] = [];
    for (let i = 0; i < 100; i++) {
      const t0 = performance.now();
      const det = extractDeterministicCv(mediumCv);
      mapCvToCanonicalTaxonomy(det);
      latencies.push(performance.now() - t0);
    }

    const stats = computePercentiles(latencies);
    expect(stats.p95).toBeLessThan(700);
    expect(stats.p99).toBeLessThan(900);
  });

  it('Performance 3: 100 Large Multi-page CVs throughput benchmark', () => {
    const latencies: number[] = [];
    for (let i = 0; i < 100; i++) {
      const t0 = performance.now();
      const det = extractDeterministicCv(largeCv);
      mapCvToCanonicalTaxonomy(det);
      latencies.push(performance.now() - t0);
    }

    const stats = computePercentiles(latencies);
    expect(stats.p95).toBeLessThan(450);
    expect(stats.p99).toBeLessThan(700);
  });
});
