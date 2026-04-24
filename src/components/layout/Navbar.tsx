"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, Trophy, BarChart3, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Bloquear scroll del body al abrir el menú
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Inicio", href: "/", icon: Zap },
    { name: "Pronósticos", href: "/picks", icon: Trophy },
    { name: "Clasificación", href: "/standings", icon: Trophy },
    { name: "Estadísticas", href: "/stats", icon: BarChart3 },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6",
        scrolled 
          ? "py-4 bg-bg-base/80 backdrop-blur-md border-b border-border-base" 
          : "py-8 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          onClick={() => setIsOpen(false)}
          className="text-2xl font-black italic tracking-tighter flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="bg-accent p-1.5 rounded-sm rotate-12 group-hover:rotate-0 transition-transform duration-300">
              <Zap className="h-5 w-5 text-bg-base fill-bg-base" />
            </div>
            <div className="absolute inset-0 bg-accent rounded-sm animate-pulse-electric opacity-20 blur-sm" />
          </div>
          <span className="text-text-primary uppercase tracking-tighter">
            PULSO<span className="text-accent">ODDS</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative group flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <span className={cn(
                  "text-[9px] font-bold transition-colors",
                  isActive ? "text-accent" : "text-text-muted group-hover:text-accent/50"
                )}>
                  0{i + 1}
                </span>
                <span>{link.name}</span>
                {isActive && (
                  <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-accent" />
                )}
              </Link>
            );
          })}
          <Link
            href="/admin"
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-border-base bg-bg-surface text-[10px] font-black uppercase tracking-widest hover:border-border-accent hover:text-accent transition-all duration-300"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 md:hidden h-11 w-11 flex items-center justify-center rounded-lg bg-bg-surface border border-border-base text-text-primary transition-all active:scale-95"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-bg-base z-40 md:hidden transition-all duration-500 ease-in-out px-8 pt-32 pb-12 flex flex-col justify-between",
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-8">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Navegación</span>
            <div className="h-[2px] w-12 bg-accent mt-3" />
          </div>
          
          {navLinks.map((link, i) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-5xl font-black uppercase tracking-tighter flex items-center justify-between group transition-all duration-300",
                pathname === link.href ? "text-accent" : "text-text-primary hover:text-accent"
              )}
              style={{ 
                transitionDelay: isOpen ? `${i * 100}ms` : "0ms",
                transform: isOpen ? "translateX(0)" : "translateX(40px)"
              }}
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-text-muted group-hover:text-accent/40 duration-300">0{i + 1}</span>
                <span>{link.name}</span>
              </div>
              <link.icon className={cn("h-8 w-8 transition-transform duration-300 group-hover:scale-125", pathname === link.href ? "text-accent" : "text-text-muted/20")} />
            </Link>
          ))}
        </div>

        <div className="space-y-6">
          <Link
            href="/admin"
            className="flex items-center justify-between px-8 py-5 rounded-xl bg-bg-surface border border-border-base text-text-secondary font-black uppercase tracking-widest text-xs hover:border-border-accent hover:text-accent transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <Lock className="h-5 w-5" />
              Acceso Admin
            </div>
          </Link>
          <p className="text-[10px] text-text-muted text-center uppercase tracking-[0.3em] font-black">
            © 2026 PULSOODDS — PREMIUM ANALYTICS
          </p>
        </div>
      </div>
    </nav>
  );
}
