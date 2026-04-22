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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
        scrolled ? "py-4 bg-deep-black/80 backdrop-blur-xl border-b border-white/5" : "py-6 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          onClick={() => setIsOpen(false)}
          className="text-2xl font-black italic tracking-tighter flex items-center gap-2 group"
        >
          <div className="bg-neon-green p-1 rounded-sm rotate-12 group-hover:rotate-0 transition-transform">
            <Zap className="h-5 w-5 text-black fill-black" />
          </div>
          <span>PULSO<span className="text-neon-green">ODDS</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-xs font-black uppercase tracking-widest transition-colors hover:text-neon-green",
                pathname === link.href ? "text-neon-green" : "text-white/60"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/40 hover:text-white"
          >
            <Lock className="h-3 w-3" />
            Admin
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white transition-transform active:scale-95"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black z-40 md:hidden transition-all duration-300 ease-in-out px-8 pt-24 pb-12 flex flex-col justify-between",
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Navegación</span>
            <div className="h-[1px] w-12 bg-neon-green mt-2" />
          </div>
          
          {navLinks.map((link, i) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-4xl font-black uppercase tracking-tighter flex items-center justify-between group transition-all duration-300",
                pathname === link.href ? "text-neon-green" : "text-white hover:text-neon-green"
              )}
              style={{ 
                transitionDelay: isOpen ? `${i * 100}ms` : "0ms",
                transform: isOpen ? "translateX(0)" : "translateX(20px)"
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white/10 group-hover:text-neon-green/40 duration-300">0{i + 1}</span>
                <span>{link.name}</span>
              </div>
              <link.icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-125", pathname === link.href ? "text-neon-green" : "text-white/20")} />
            </Link>
          ))}
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <Link
              href="/admin"
              className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-neon-green hover:text-black hover:border-neon-green transition-all"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4" />
                Admin / Zona Privada
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-white/5" />
             <span className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em]">Siguenos</span>
             <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <p className="text-[10px] text-white/30 text-center uppercase tracking-widest font-bold">
            © 2026 PULSOODDS — PREDICTIVE ANALYTICS
          </p>
        </div>

        {/* Decorative Grid for Mobile Menu */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-neon-green/10 to-transparent pointer-events-none opacity-50" />
      </div>
    </nav>
  );
}
