'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar, AdminMobileNav } from '@/components/admin/AdminNav';
import { Loader2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || session.user.email !== 'jukk4p@gmail.com') {
        router.push('/login');
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-neon-green animate-spin" />
      </div>
    );
  }

  // Page title for mobile header
  const pageTitles: Record<string, string> = {
    '/admin/picks': 'Apuestas',
    '/admin/rankings': 'Clasificaciones',
    '/admin/matches': 'Partidos',
    '/admin/stats': 'Métricas',
  };
  const currentTitle = pageTitles[pathname] ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-deep-black w-full overflow-x-hidden min-w-0">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-white/[0.02] fixed inset-y-0 left-0 z-30">
        <div className="px-8 py-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group mb-6">
            <div className="bg-neon-green p-1.5 rounded-sm rotate-12 group-hover:rotate-0 transition-transform duration-300">
              <Zap className="h-4 w-4 text-deep-black fill-deep-black" />
            </div>
            <span className="text-lg font-black uppercase tracking-tighter text-white">
              PULSO<span className="text-neon-green">ODDS</span>
            </span>
          </Link>
          <h2 className="text-xs font-black text-neon-green italic tracking-[0.3em] uppercase">PANEL DE ADMIN</h2>
        </div>
        <div className="flex-1 py-6">
          <AdminSidebar />
        </div>
        <div className="px-8 py-6 border-t border-white/5">
          <Link href="/" className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[90] flex items-center justify-between px-5 h-16 bg-[#0A0A0A]/95 backdrop-blur-2xl border-b border-white/8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-neon-green p-1 rounded-sm rotate-12">
            <Zap className="h-3.5 w-3.5 text-deep-black fill-deep-black" />
          </div>
          <span className="text-sm font-black uppercase tracking-tighter text-white">
            PULSO<span className="text-neon-green">ODDS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neon-green border border-neon-green/30 bg-neon-green/10 px-3 py-1.5 rounded-full">
            {currentTitle}
          </span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 min-h-screen min-w-0 w-full overflow-x-hidden">
        {/*
          Mobile:  top-16 (admin header) + spacing, bottom-20 (mobile tab nav)
          Desktop: no top offset from admin header (sidebar handles it), standard bottom
        */}
        <div className="pt-20 md:pt-10 pb-28 md:pb-12 px-4 md:px-10 min-w-0 w-full overflow-x-hidden">
          <div className="max-w-6xl mx-auto min-w-0 w-full overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Tab Bar ── */}
      <AdminMobileNav />
    </div>
  );
}
