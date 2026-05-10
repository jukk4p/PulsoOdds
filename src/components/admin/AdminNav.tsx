"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, Trophy, BarChart3, Calendar } from "lucide-react";

const navItems = [
  { label: "Apuestas", href: "/admin/picks", icon: Zap },
  { label: "Clasificaciones", href: "/admin/rankings", icon: Trophy },
  { label: "Partidos", href: "/admin/matches", icon: Calendar },
  { label: "Métricas", href: "/admin/stats", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
              isActive
                ? "bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-[0_0_20px_rgba(200,255,0,0.1)]"
                : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <item.icon
              size={16}
              className={cn(
                "transition-transform duration-500 shrink-0",
                isActive && "text-neon-green"
              )}
            />
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
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/8" />

      <div className="relative flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-300 min-w-[64px]",
                isActive
                  ? "text-neon-green"
                  : "text-white/30 active:text-white/70"
              )}
            >
              {/* Active indicator line above icon */}
              <div
                className={cn(
                  "h-0.5 w-6 rounded-full mb-1 transition-all duration-300",
                  isActive
                    ? "bg-neon-green shadow-[0_0_8px_rgba(200,255,0,0.8)]"
                    : "bg-transparent"
                )}
              />
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all duration-300"
              />
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-wider transition-colors duration-300",
                  isActive ? "text-neon-green" : "text-white/30"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
