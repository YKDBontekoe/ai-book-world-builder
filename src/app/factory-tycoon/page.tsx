import TycoonGame from '@/features/factory-tycoon/TycoonGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Factory Tycoon',
  description: 'A resource management tycoon game.',
};

export default function Page(): JSX.Element {
  return (
    <main className="h-screen w-full">
      <TycoonGame />
    </main>
  );
}
