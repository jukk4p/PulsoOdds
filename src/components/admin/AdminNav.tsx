"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const links = [
    { name: "Gestionar Picks", href: "/admin/picks", icon: Zap },
    { name: "Métricas", href: "/admin/stats", icon: BarChart3 },
  ];

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              isActive 
                ? "bg-neon-green text-deep-black shadow-[0_0_20px_rgba(0,255,135,0.2)]" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all mt-10"
      >
        <LogOut className="h-4 w-4" />
        Cerrar Sesión
      </button>
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Picks", href: "/admin/picks" },
    { name: "Métricas", href: "/admin/stats" },
  ];

  return (
    <div className="md:hidden flex items-center justify-center gap-8 mb-10 border-b border-white/5 pb-4">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <div key={tab.href} className="relative">
            <Link
              href={tab.href}
              className={cn(
                "px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                isActive ? "text-neon-green" : "text-white/40"
              )}
            >
              {tab.name}
            </Link>
            {isActive && (
              <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-neon-green shadow-[0_0_10px_rgba(0,255,135,0.5)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
