export const dynamic = "force-dynamic";
export const revalidate = 0;

import { PickCard } from "@/components/ui/PickCard";
import { PickRow } from "@/components/ui/PickRow";
import { calculateStats, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Target, Zap, Trophy } from "lucide-react";
import Link from "next/link";

async function getData() {
  const { data: picks, error } = await supabase
    .from('picks')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: allPicks } = await supabase.from('picks').select('*');
  
  const stats = calculateStats(allPicks || []);
  return { recentPicks: picks || [], stats };
}

export default async function Home() {
  const { recentPicks, stats } = await getData();

  return (
    <div className="bg-deep-black min-h-screen text-white">
      {/* Hero Section */}
      <header className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-green/10 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 italic">
                TUS RESULTADOS <br />
                <span className="text-neon-green animate-pulse-neon drop-shadow-[0_0_15px_rgba(0,255,135,0.4)]">MÁS CLAROS</span>
              </h1>
              <p className="text-xl text-white/50 max-w-lg mb-10 leading-relaxed font-medium">
                Análisis deportivo honesto con resultados a la vista. 
                Te damos la información que necesitas para que tomes mejores decisiones, día a día.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href="/picks" className="bg-neon-green text-deep-black font-black uppercase text-xs tracking-widest px-10 py-5 rounded-xl hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] transition-all active:scale-95">
                  Ver Pronósticos
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="ROI MENSUAL" value={`${stats.roi.toFixed(1)}%`} icon={<TrendingUp className="h-5 w-5" />} color="neon" />
              <StatCard label="ACIERTO" value={`${stats.winRate.toFixed(1)}%`} icon={<Target className="h-5 w-5" />} color="white" />
              <StatCard label="RACHA ACTUAL" value={stats.currentStreak > 0 ? `+${stats.currentStreak}` : stats.currentStreak} icon={<Zap className="h-5 w-5" />} color="neon" />
              <StatCard label="UNIDADES" value={(stats.totalProfit > 0 ? '+' : '') + stats.totalProfit.toFixed(1)} icon={<Trophy className="h-5 w-5" />} color="white" />
            </div>
          </div>
        </div>
      </header>

      {/* Latest Picks */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black">ÚLTIMOS <span className="text-neon-green">PICKS</span></h2>
              <p className="text-white/40">Lo más reciente de nuestros expertos</p>
            </div>
            <Link href="/picks" className="text-neon-green text-sm font-bold border-b border-neon-green/30 hover:border-neon-green transition-all pb-1">
              Ver todos
            </Link>
          </div>

          <div className="glass-card neon-border rounded-2xl overflow-hidden divide-y divide-white/5">
            {recentPicks.map((pick) => (
              <PickRow key={pick.id} pick={pick} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: 'neon' | 'white' }) {
  return (
    <div className={cn(
      "glass-card rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02]",
      color === 'neon' ? "border-neon-green/30 hover:shadow-[0_0_20px_rgba(0,255,135,0.1)]" : "border-white/10"
    )}>
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-colors", 
        color === 'neon' ? "bg-neon-green/20 text-neon-green" : "bg-white/10 text-white")}>
        {icon}
      </div>
      <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className={cn("text-4xl font-black transition-all", color === 'neon' ? "text-neon-green text-neon" : "text-white")}>
        {value}
      </p>
    </div>
  );
}
