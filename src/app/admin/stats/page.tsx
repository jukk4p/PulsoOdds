'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Target, Zap, Trophy, TrendingDown, Activity, PieChart, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfitChart } from '@/components/ProfitChart';

export default function AdminStatsPage() {
  const [stats, setStats] = useState({
    totalPicks: 0,
    won: 0,
    lost: 0,
    pending: 0,
    void: 0,
    profit: 0,
    roi: 0,
    winRate: 0,
    totalStaked: 0,
    chartData: [] as { date: string; profit: number }[],
    sportData: {} as Record<string, { won: number, lost: number, profit: number }>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('picks')
        .select('*');

      if (!error && data) {
        let won = 0, lost = 0, pending = 0, voidPicks = 0;
        let profit = 0, totalStaked = 0;

        const chartData: { date: string; profit: number }[] = [];
        const sportData: Record<string, { won: number, lost: number, profit: number }> = {};

        data.forEach(pick => {
          let pickProfit = 0;
          if (pick.status === 'won') {
            won++;
            pickProfit = (pick.odds - 1) * pick.stake;
            profit += pickProfit;
            totalStaked += pick.stake;
          } else if (pick.status === 'lost') {
            lost++;
            pickProfit = -pick.stake;
            profit += pickProfit;
            totalStaked += pick.stake;
          } else if (pick.status === 'pending') {
            pending++;
          } else if (pick.status === 'void') {
            voidPicks++;
          }

          if (pick.status !== 'pending') {
            chartData.push({
              date: pick.published_at || pick.created_at,
              profit: pickProfit
            });

            const sport = pick.sport || 'football';
            if (!sportData[sport]) sportData[sport] = { won: 0, lost: 0, profit: 0 };
            if (pick.status === 'won') sportData[sport].won++;
            if (pick.status === 'lost') sportData[sport].lost++;
            sportData[sport].profit += pickProfit;
          }
        });

        const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0;
        const totalResolved = won + lost;
        const winRate = totalResolved > 0 ? (won / totalResolved) * 100 : 0;

        setStats({
          totalPicks: data.length,
          won,
          lost,
          pending,
          void: voidPicks,
          profit,
          roi,
          winRate,
          totalStaked,
          chartData,
          sportData
        });
      }
      setLoading(false);
    };

    fetchAndCalculateStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
          MÉTRICAS <span className="text-neon-green">DE RENDIMIENTO</span>
        </h1>
        <p className="text-white/40 mt-2 text-sm md:text-base font-medium">Análisis profundo de rentabilidad y precisión operativa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard 
            label="Beneficio Total" 
            value={`${stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(2)}`}
            subValue="Unidades"
            icon={<TrendingUp className="h-6 w-6" />}
            variant={stats.profit >= 0 ? 'success' : 'danger'}
          />
          <StatCard 
            label="ROI / Rentabilidad" 
            value={`${stats.roi.toFixed(1)}%`}
            subValue="Sobre inversión"
            icon={<Activity className="h-6 w-6" />}
            variant="default"
          />
          <StatCard 
            label="Tasa de Acierto" 
            value={`${stats.winRate.toFixed(1)}%`}
            subValue={`${stats.won} Verdes / ${stats.lost} Rojos`}
            icon={<Target className="h-6 w-6" />}
            variant="success"
          />
          <StatCard 
            label="Volumen de Juego" 
            value={stats.totalStaked.toFixed(0)}
            subValue="Unidades apostadas"
            icon={<Zap className="h-6 w-6" />}
            variant="default"
          />
        </div>

        {/* Quick Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-accent" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Distribución</h3>
          </div>
          
          <div className="space-y-4">
            <BreakdownItem label="Picks Ganados" value={stats.won} total={stats.won + stats.lost} color="bg-neon-green" />
            <BreakdownItem label="Picks Perdidos" value={stats.lost} total={stats.won + stats.lost} color="bg-red-500" />
            <BreakdownItem label="En Espera" value={stats.pending} total={stats.totalPicks} color="bg-yellow-500" />
          </div>

          <div className="pt-6 border-t border-white/5">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
               <span>Picks Totales</span>
               <span className="text-white">{stats.totalPicks}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card p-8 rounded-3xl border border-white/5 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-neon-green" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Evolución de Beneficios</h3>
              </div>
              <p className="text-[10px] text-white/40 font-medium mt-1">Curva acumulada de beneficios por unidades.</p>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase text-white/40">Todo el tiempo</div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ProfitChart data={stats.chartData} />
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-8">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-neon-green" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Por Deporte</h3>
          </div>
          
          <div className="space-y-6">
            {Object.entries(stats.sportData).map(([sport, data]) => (
              <div key={sport} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60 capitalize">{sport === 'football' ? 'fútbol' : sport}</span>
                  <span className={cn(
                    "text-xs font-bold",
                    data.profit >= 0 ? "text-neon-green" : "text-red-500"
                  )}>
                    {data.profit >= 0 ? '+' : ''}{data.profit.toFixed(1)}u
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="bg-neon-green h-full" 
                    style={{ width: `${(data.won / (data.won + data.lost || 1)) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-white/20">
                  <span>{data.won}G - {data.lost}P</span>
                  <span>Rentabilidad: {((data.profit / (data.won + data.lost || 1)) * 10).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, variant = 'default' }: { 
  label: string; 
  value: string; 
  subValue: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'danger'
}) {
  return (
    <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
      <div className={cn(
        "absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity",
        variant === 'success' ? "text-neon-green" : variant === 'danger' ? "text-red-500" : "text-white"
      )}>
        {icon}
      </div>
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{label}</p>
      <div className="space-y-1">
        <h2 className={cn(
          "text-4xl font-black tracking-tighter italic",
          variant === 'success' ? "text-neon-green" : variant === 'danger' ? "text-red-500" : "text-white"
        )}>
          {value}
        </h2>
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{subValue}</p>
      </div>
    </div>
  );
}

function BreakdownItem({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-tighter text-white/40">{label}</span>
        <span className="text-xs font-mono text-white/80">{value}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
