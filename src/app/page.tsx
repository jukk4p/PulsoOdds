export const dynamic = "force-dynamic";
export const revalidate = 0;


import { MatchGroup } from "@/components/ui/MatchGroup";
import { calculateStats, cn, simpleNormalize } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/ui/StatCard";
import { TopPicksSection } from "@/components/picks/TopPicksSection";
import Link from "next/link";

async function getData() {
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('status', 'pending')
    .gte('odds', 1.50)
    .order('match_date', { ascending: true })
    .limit(30);

  const { data: allPicks } = await supabase.from('picks').select('*');
  const stats = calculateStats(allPicks || []);

  const topPicks = (picks || []).filter(p =>
    (p.confianza != null && p.confianza >= 85) || (p.stake != null && p.stake >= 8.5)
  );

  const groupedPicks = topPicks.reduce((acc, pick) => {
    const d = new Date(pick.match_date);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const matchKey = `${simpleNormalize(pick.match || "")}_${dayKey}`;
    if (!acc[matchKey]) acc[matchKey] = [];
    acc[matchKey].push(pick);
    return acc;
  }, {} as Record<string, any[]>);

  const groupedRecentPicks = Object.values(groupedPicks).slice(0, 4) as any[][];
  return { groupedRecentPicks, stats };
}

export default async function Home() {
  const { groupedRecentPicks, stats } = await getData();

  return (
    <div className="bg-bg-base min-h-screen text-text-primary font-body">
      {/* Hero Section */}
      <header className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Predictive Analytics Engine
              </div>

              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.85] tracking-tighter mb-10 uppercase">
                Tu Ventaja <br />
                <span className="text-accent text-glow">Eléctrica</span>
              </h1>
              
              <p className="text-lg md:text-xl text-text-secondary max-w-lg mb-12 leading-relaxed font-medium">
                Análisis deportivo de alto impacto basado en datos, no en corazonadas. 
                Transparencia total y rentabilidad verificada.
              </p>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <Link 
                  href="/picks" 
                  className="bg-accent text-bg-base font-black uppercase text-xs tracking-[0.2em] px-12 py-5 rounded-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(200,255,0,0.2)]"
                >
                  Explorar Picks
                </Link>
                <Link 
                  href="/stats" 
                  className="flex items-center gap-3 text-text-primary font-black uppercase text-xs tracking-[0.2em] px-8 py-5 border border-border-base hover:border-accent transition-all duration-300"
                >
                  Nuestras Stats
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="ROI Mensual" 
                value={`${stats.roi.toFixed(1)}%`} 
                subtext="Rentabilidad Activa"
                trend={stats.roi > 0 ? "up" : "down"}
              />
              <StatCard 
                label="Tasa de Acierto" 
                value={`${stats.winRate.toFixed(0)}%`} 
                subtext="Precisión Total"
              />
              <StatCard 
                label="Racha Actual" 
                value={stats.currentStreak > 0 ? `+${stats.currentStreak}` : stats.currentStreak} 
                subtext="Picks seguidos"
                trend={stats.currentStreak > 0 ? "up" : "neutral"}
              />
              <StatCard 
                label="Profit Unidades" 
                value={(stats.totalProfit > 0 ? '+' : '') + stats.totalProfit.toFixed(1)} 
                subtext="Beneficio Total"
                trend={stats.totalProfit > 0 ? "up" : "down"}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Latest Picks Section */}
      <section className="py-24 px-6 bg-bg-surface/50 border-t border-border-base">
        <div className="max-w-[900px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="h-1 w-12 bg-accent mb-4" />
              <h2 className="text-4xl font-display font-black uppercase tracking-tight">
                Top <span className="text-accent">Picks</span>
              </h2>
              <p className="text-text-secondary mt-2 font-medium">Pronósticos de alta confianza seleccionados para hoy</p>
            </div>
            <Link 
              href="/picks" 
              className="group flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest"
            >
              Ver todos los picks
              <div className="h-[1px] w-6 bg-accent transition-all duration-300 group-hover:w-12" />
            </Link>
          </div>

          <TopPicksSection groupedRecentPicks={groupedRecentPicks} />

        </div>
      </section>
    </div>
  );
}
