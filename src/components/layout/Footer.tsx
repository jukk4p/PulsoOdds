import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-deep-black border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="bg-neon-green p-1.5 rounded-lg rotate-12 group-hover:rotate-0 transition-all">
                <Zap className="h-5 w-5 text-black fill-black" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-white">
                PULSO<span className="text-neon-green">ODDS</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              La plataforma definitiva para el análisis deportivo. Ofrecemos información verificada y estratégica para elevar tu nivel de pronóstico al siguiente escalón.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
                </svg>
              } />
              <SocialLink href="#" icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              } />
              <SocialLink href="#" icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
              } />
            </div>
          </div>

          {/* Nav Col */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Navegación</h4>
            <ul className="space-y-4">
              <FooterLink href="/">Página de Inicio</FooterLink>
              <FooterLink href="/picks">Pronósticos</FooterLink>
              <FooterLink href="/admin/picks">Área de Admin</FooterLink>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Legal</h4>
            <ul className="space-y-4">
              <FooterLink href="/terminos-y-condiciones">Términos y Condiciones</FooterLink>
              <FooterLink href="/politica-de-privacidad">Política de Privacidad</FooterLink>
              <FooterLink href="/politica-de-cookies">Política de Cookies</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest">
            <span>© 2026 PulsoOdds</span>
            <span className="h-4 w-px bg-white/10" />
            <span className="flex items-center gap-1.5 text-neon-green">
              <div className="h-4 w-6 bg-neon-green/10 border border-neon-green/40 flex items-center justify-center rounded-sm text-[8px]">+18</div>
              Jugar con Responsabilidad
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
      <Link href={href} className="text-sm text-white/40 hover:text-neon-green transition-colors font-medium">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 text-white/40 hover:text-neon-green hover:border-neon-green/30 hover:bg-neon-green/5 transition-all"
    >
      {icon}
    </a>
  );
}
