import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulsoOdds | Pronósticos de Apuestas Deportivas Premium",
  description: "La plataforma definitiva para seguir picks de expertos con rentabilidad verificada y análisis profesional.",
  openGraph: {
    title: "PulsoOdds - Tu Ventaja Eléctrica",
    description: "Análisis deportivo de alto impacto con rentabilidad verificada.",
    type: "website",
    locale: "es_ES",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-deep-black text-white">
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-white/5 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xl font-black italic tracking-tighter">
              PULSO<span className="text-neon-green">ODDS</span>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 PulsoOdds. Juega con responsabilidad. +18
            </p>
            <div className="flex gap-6 text-white/40 text-sm">
              <a href="#" className="hover:text-white">Términos</a>
              <a href="#" className="hover:text-white">Privacidad</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
