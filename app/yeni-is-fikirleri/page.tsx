import { Metadata } from 'next';
import { HomeBusinessIdeasSection } from '@/components/girisimco/home/HomeBusinessIdeasSection';

export const metadata: Metadata = {
  title: 'Yeni İş Fikirleri, Ek Gelir & Mikro Girişim Modelleri | GirişimBee',
  description:
    'Sıfır veya düşük sermayeyle hemen başlanabilecek, mesai sonrası ek gelir sağlayan veya tam zamanlı sıcak nakit üreten gerçekçi iş modelleri ve uygulama rehberi.',
};

export default function YeniIsFikirleriPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-background pt-6 pb-20">
      <HomeBusinessIdeasSection />
    </main>
  );
}
