import { ProfitChart } from "@/components/ProfitChart";
import { supabase } from "@/lib/supabase";
import { calculateStats, cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart3, PieChart } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getStatsData() {
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .neq('status', 'pending');

  const stats = calculateStats(picks || []);
  
  const dailyProfits: { date: string; profit: number }[] = [];
  (picks || []).forEach(p => {
    let profit = 0;
    if (p.status === 'won') profit = (p.stake * p.odds) - p.stake;
    else if (p.status === 'lost') profit = -p.stake;
    
    if (profit !== 0) {
      dailyProfits.push({ date: p.published_at || p.created_at, profit });
    }
  });

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
    <div className="min-h-screen bg-bg-base py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="h-1.5 w-16 bg-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-display font-black text-text-primary uppercase tracking-tighter">
            Métricas de <span className="text-accent text-glow">Rendimiento</span>
          </h1>
          <p className="text-text-secondary mt-4 font-medium max-w-2xl">
            Análisis algorítmico de rentabilidad y estadísticas históricas verificadas. 
            Transparencia total en cada unidad apostada.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-bg-surface p-8 rounded-lg border border-border-base relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent/20" />
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-black uppercase tracking-widest text-text-primary">Evolución de Beneficios</h2>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-muted bg-bg-base px-3 py-1.5 border border-border-base rounded-sm">
                Unidades acumuladas
              </div>
            </div>
            <div className="h-[350px]">
              <ProfitChart data={dailyProfits} />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-4">
            <StatCard 
              label="ROI Global" 
              value={`${stats.roi.toFixed(1)}%`} 
              subtext="Rentabilidad histórica" 
              trend={stats.roi > 0 ? "up" : "down"}
            />
            <StatCard 
              label="Tasa de Acierto" 
              value={`${stats.winRate.toFixed(1)}%`} 
              subtext="Precisión analítica" 
              trend={stats.winRate > 50 ? "up" : "neutral"}
            />
            <StatCard 
              label="Profit Total" 
              value={`${stats.totalProfit.toFixed(1)}`} 
              subtext="Unidades netas" 
              trend={stats.totalProfit > 0 ? "up" : "down"}
            />
          </div>
        </div>

        {/* ROI by Sport */}
        <div className="bg-bg-surface rounded-lg border border-border-base overflow-hidden">
          <div className="p-8 border-b border-border-base flex items-center gap-4 bg-bg-surface">
            <PieChart className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-black uppercase tracking-widest text-text-primary">Rendimiento por Disciplina</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-text-muted tracking-[0.3em] bg-bg-base/50">
                  <th className="px-8 py-5 font-black">Disciplina</th>
                  <th className="px-8 py-5 font-black text-center">Eventos</th>
                  <th className="px-8 py-5 font-black text-center">Inversión</th>
                  <th className="px-8 py-5 font-black text-center">Beneficio</th>
                  <th className="px-8 py-5 font-black text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {sportsData.map(([sport, d]: [string, any]) => {
                  const roiValue = (d.profit / d.stake * 100);
                  return (
                    <tr key={sport} className="group hover:bg-accent/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(200,255,0,0.5)]" />
                          <span className="font-display font-black text-text-primary uppercase tracking-tight text-base">
                            {sport}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-mono font-bold text-text-secondary">{d.count}</td>
                      <td className="px-8 py-6 text-center font-mono font-bold text-text-secondary">{d.stake.toFixed(1)} u</td>
                      <td className={cn(
                        "px-8 py-6 text-center font-mono font-black italic", 
                        d.profit >= 0 ? "text-accent" : "text-red-500"
                      )}>
                        {d.profit > 0 ? '+' : ''}{d.profit.toFixed(1)} u
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={cn(
                          "inline-flex items-center justify-center px-4 py-2 rounded-sm text-xs font-mono font-black border transition-all",
                          roiValue >= 0 
                            ? "bg-accent/10 text-accent border-accent/20" 
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
