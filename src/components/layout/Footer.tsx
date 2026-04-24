import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-bg-base border-t border-border-base py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="bg-accent p-2 rounded-sm rotate-12 group-hover:rotate-0 transition-all duration-300">
                <Zap className="h-6 w-6 text-bg-base fill-bg-base" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-text-primary uppercase">
                PULSO<span className="text-accent">ODDS</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-sm leading-relaxed font-medium">
              La plataforma definitiva para el análisis deportivo. Ofrecemos información verificada y estratégica para elevar tu nivel de pronóstico al siguiente escalón.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
                </svg>
              } />
              <SocialLink href="#" icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              } />
              <SocialLink href="#" icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
              } />
            </div>
          </div>

          {/* Nav Col */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted mb-8">Navegación</h4>
            <ul className="space-y-4 text-center md:text-left">
              <FooterLink href="/">Página de Inicio</FooterLink>
              <FooterLink href="/picks">Pronósticos</FooterLink>
              <FooterLink href="/stats">Estadísticas</FooterLink>
              <FooterLink href="/admin">Panel de Control</FooterLink>
            </ul>
          </div>

          {/* Legal Col */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted mb-8">Legal</h4>
            <ul className="space-y-4 text-center md:text-left">
              <FooterLink href="/terminos-y-condiciones">Términos y Condiciones</FooterLink>
              <FooterLink href="/politica-de-privacidad">Política de Privacidad</FooterLink>
              <FooterLink href="/politica-de-cookies">Política de Cookies</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-border-base flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-6 text-text-muted text-[10px] font-black uppercase tracking-widest">
            <span>© 2026 PulsoOdds</span>
            <span className="h-4 w-px bg-border-base" />
            <span className="flex items-center gap-3 text-accent">
              <div className="h-5 w-8 bg-accent/10 border border-accent/30 flex items-center justify-center rounded-sm text-[9px] font-bold">+18</div>
              Juego Responsable
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-text-secondary hover:text-accent transition-colors duration-200 font-bold">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="h-12 w-12 bg-bg-surface rounded-lg flex items-center justify-center border border-border-base text-text-muted hover:text-accent hover:border-border-accent hover:bg-accent-dim transition-all duration-300"
    >
      {icon}
    </a>
  );
}
