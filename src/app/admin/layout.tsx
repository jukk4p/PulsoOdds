'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar, AdminMobileNav } from '@/components/admin/AdminNav';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

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
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-neon-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-deep-black">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-white/[0.02] p-6 fixed inset-y-0 left-0 pt-32">
        <div className="mb-10 px-2 text-center md:text-left">
          <h2 className="text-xl font-black text-neon-green italic tracking-tighter">ADMIN PANEL</h2>
          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Sincronización Total</p>
        </div>
        
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-28 md:pt-32 px-4 md:px-10 pb-20">
        <AdminMobileNav />
        
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
