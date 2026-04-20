import { ProfitChart } from "@/components/ProfitChart";
import { redirect } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import { calculateStats, cn } from "@/lib/utils";
import { TrendingUp, BarChart3, PieChart, Activity, Zap } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getStatsData() {
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .neq('status', 'pending');

  const stats = calculateStats(picks || []);
  
  // Prepare daily profit data for the chart
  const dailyProfits: { date: string; profit: number }[] = [];
  (picks || []).forEach(p => {
    let profit = 0;
    if (p.status === 'won') profit = (p.stake * p.odds) - p.stake;
    else if (p.status === 'lost') profit = -p.stake;
    
    if (profit !== 0) {
      dailyProfits.push({ date: p.published_at || p.created_at, profit });
    }
  });

  // Group by sport
  const sportsData: Record<string, { stake: number; profit: number; count: number }> = {};
  (picks || []).forEach(p => {
    const sportName = (p.sport || 'Otros').toLowerCase() === 'football' ? 'Fútbol' : p.sport;
    if (!sportsData[sportName]) sportsData[sportName] = { stake: 0, profit: 0, count: 0 };
    sportsData[sportName].count++;
    sportsData[sportName].stake += p.stake;
    if (p.status === 'won') sportsData[sportName].profit += (p.stake * p.odds) - p.stake;
    else if (p.status === 'lost') sportsData[sportName].profit -= p.stake;
  });

  return { stats, dailyProfits, sportsData: Object.entries(sportsData) };
}

export default async function StatsPage() {
  const { stats, dailyProfits, sportsData } = await getStatsData();

  return (
    <div className="min-h-screen bg-deep-black py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            MÉTRICAS DE <span className="text-neon-green">RENDIMIENTO</span>
          </h1>
          <p className="text-white/40">Análisis detallado de nuestra rentabilidad y estadísticas históricas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-neon-green" />
                <h2 className="text-xl font-bold text-white">Evolución de Beneficios</h2>
              </div>
              <div className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">Últimos 30 días</div>
            </div>
            <ProfitChart data={dailyProfits} />
          </div>

          {/* Quick Metrics */}
          <div className="space-y-4">
            <StatsMiniCard label="ROI Global" value={`${stats.roi.toFixed(1)}%`} subtext="Rentabilidad total" icon={<Activity className="text-neon-green" />} />
            <StatsMiniCard label="Acierto" value={`${stats.winRate.toFixed(1)}%`} subtext="Tasa de predicción" icon={<TrendingUp className="text-white" />} />
            <StatsMiniCard label="Profit Total" value={`${stats.totalProfit.toFixed(1)}`} subtext="Unidades ganadas" icon={<Zap className="text-neon-green" />} />
          </div>
        </div>

        {/* ROI by Sport Table */}
        <div className="glass-card rounded-2xl p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <PieChart className="h-5 w-5 text-neon-green" />
            <h2 className="text-xl font-bold text-white">Rendimiento por Deporte</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] md:text-[12px] uppercase text-white/20 tracking-[0.2em] border-b border-white/5">
                  <th className="pb-6 font-black text-left">Deporte</th>
                  <th className="pb-6 font-black text-center">Picks</th>
                  <th className="pb-6 font-black text-center">Inversión</th>
                  <th className="pb-6 font-black text-center">Beneficio</th>
                  <th className="pb-6 font-black text-center">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sportsData.map(([sport, d]: [string, any]) => {
                  const roiValue = (d.profit / d.stake * 100);
                  return (
                    <tr key={sport} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 font-black text-white uppercase text-sm md:text-base tracking-tight">{sport}</td>
                      <td className="py-6 text-center text-white/60 text-sm md:text-base font-medium">{d.count}</td>
                      <td className="py-6 text-center text-white/60 text-sm md:text-base font-medium">{Number(d.stake.toFixed(1))} unidades</td>
                      <td className={cn(
                        "py-6 text-center text-sm md:text-base font-black italic", 
                        d.profit >= 0 ? "text-neon-green" : "text-red-500"
                      )}>
                        {d.profit > 0 ? '+' : ''}{Number(d.profit.toFixed(1))} unidades
                      </td>
                      <td className="py-6 text-center">
                        <span className={cn(
                          "inline-flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-[13px] font-black min-w-[60px] md:min-w-[85px] border transition-all",
                          roiValue >= 0 
                            ? "bg-neon-green/10 text-neon-green border-neon-green/20 shadow-[0_0_10px_rgba(0,230,118,0.1)]" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {roiValue > 0 ? '+' : ''}{roiValue.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsMiniCard({ label, value, subtext, icon }: any) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="text-xs text-white/20 mt-1">{subtext}</p>
      </div>
      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
