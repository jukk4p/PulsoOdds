import { PickCard } from "@/components/ui/PickCard";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Calendar, ShieldCheck, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const pick = await getPick(params.id);
  if (!pick) return { title: 'Pick no encontrado' };

  return {
    title: `${pick.match} | Pronóstico ${pick.sport} - PulsoOdds`,
    description: `Análisis para ${pick.match}. Mercado: ${pick.market}. Cuota: ${pick.odds}. Stake ${pick.stake}.`,
    openGraph: {
      title: `${pick.match} @${pick.odds}`,
      description: `Pronóstico para ${pick.competition} - ${pick.sport}`,
    }
  };
}

async function getPick(id: string) {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function PickDetailPage({ params }: { params: { id: string } }) {
  const pick = await getPick(params.id);

  if (!pick) notFound();

  return (
    <div className="min-h-screen bg-deep-black py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/picks" className="inline-flex items-center gap-2 text-white/40 hover:text-neon-green transition-colors mb-10 text-sm font-medium">
          <ChevronLeft className="h-4 w-4" /> Volver a Pronósticos
        </Link>
        
        <div className="grid md:grid-cols-[1fr_350px] gap-12 items-start">
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 text-neon-green text-xs font-bold uppercase tracking-widest mb-4">
                <ShieldCheck className="h-4 w-4" /> Análisis Verificado
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                {pick.match}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm text-white/40 border-y border-white/5 py-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(pick.match_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{pick.sport}</span>
                  <span className="h-1 w-1 bg-white/20 rounded-full" />
                  {pick.competition}
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="flex items-center gap-2 text-white font-bold mb-4">
                <Info className="h-5 w-5 text-neon-green" /> Razonamiento del Pronóstico
              </div>
              <p className="text-lg text-white/60 leading-relaxed whitespace-pre-line">
                {pick.analysis || "No hay análisis detallado para este pronóstico."}
              </p>
            </div>
          </div>

          <aside className="sticky top-24">
            <PickCard pick={pick} />
            <div className="mt-6 p-6 glass-card rounded-xl border border-white/5 bg-neon-green/5">
              <p className="text-xs text-neon-green font-bold uppercase mb-2">Recomendación</p>
              <p className="text-sm text-white/70 leading-relaxed">
                Recomendamos seguir este pick con un stake controlado de {pick.stake} unidades. 
                Recordá que el juego debe ser responsable.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
