"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, Trophy, BarChart3 } from "lucide-react";

const navItems = [
  { label: "Picks", href: "/admin/picks", icon: Zap },
  { label: "Rankings", href: "/admin/rankings", icon: Trophy },
  { label: "Métricas", href: "/admin/stats", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-6">
      <div className="mb-10 px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-50">Control Panel</h2>
      </div>
      
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-5 py-4 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all duration-300",
              isActive 
                ? "bg-accent text-bg-base shadow-[0_10px_20px_-5px_rgba(200,255,0,0.3)]" 
                : "text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-border-base"
            )}
          >
            <item.icon size={18} className={cn("transition-transform duration-500", isActive && "rotate-12")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-surface/95 backdrop-blur-xl border-t border-border-base px-8 py-5 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
                isActive ? "text-accent" : "text-text-muted"
              )}
            >
              <item.icon size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-accent rounded-full blur-[2px]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
