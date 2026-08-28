import { IntentGateway } from '@/features/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <main>
      <IntentGateway />
    </main>
  );
}
