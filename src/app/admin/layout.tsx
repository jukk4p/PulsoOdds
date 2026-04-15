import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Using the exported instance

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, we would check the session here.
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-deep-black">
      <aside className="w-64 border-r border-white/5 bg-dark-grey/50 p-6">
        <h2 className="text-xl font-bold text-neon-green mb-8">PulsoOdds Admin</h2>
        <nav className="space-y-4">
          <a href="/admin/picks" className="block text-sm text-white/70 hover:text-neon-green transition-colors">
            Gestionar Picks
          </a>
          <a href="/admin/stats" className="block text-sm text-white/70 hover:text-neon-green transition-colors">
            Métricas
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
