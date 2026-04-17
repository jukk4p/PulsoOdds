'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Target, Zap, Trophy, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    totalStaked: 0
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

        data.forEach(pick => {
          if (pick.status === 'won') {
            won++;
            const pickProfit = (pick.odds - 1) * pick.stake;
            profit += pickProfit;
            totalStaked += pick.stake;
          } else if (pick.status === 'lost') {
            lost++;
            profit -= pick.stake;
            totalStaked += pick.stake;
          } else if (pick.status === 'pending') {
            pending++;
          } else if (pick.status === 'void') {
            voidPicks++;
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
          totalStaked
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

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-24 w-24 text-neon-green" />
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Profit Total</p>
          <div className="flex items-baseline gap-2">
            <h2 className={cn(
              "text-5xl font-black tracking-tighter italic",
              stats.profit >= 0 ? "text-neon-green" : "text-red-500"
            )}>
              {stats.profit >= 0 ? '+' : ''}{stats.profit.toFixed(2)}
            </h2>
            <span className="text-white/20 font-bold uppercase text-xs">Unidades</span>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-24 w-24 text-white" />
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">ROI / Rentabilidad</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black tracking-tighter italic text-white">
              {stats.roi.toFixed(1)}%
            </h2>
            <TrendingUp className="h-6 w-6 text-neon-green" />
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="h-24 w-24 text-neon-green" />
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Tasa de Acierto</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black tracking-tighter italic text-neon-green">
              {stats.winRate.toFixed(1)}%
            </h2>
            <span className="text-white/20 font-bold uppercase text-xs">Aciertos</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Picks Totales" value={stats.totalPicks} icon={<Zap className="h-4 w-4" />} />
        <MiniStat label="Ganados" value={stats.won} icon={<Trophy className="h-4 w-4 text-neon-green" />} />
        <MiniStat label="Perdidos" value={stats.lost} icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
        <MiniStat label="Pendientes" value={stats.pending} icon={<Activity className="h-4 w-4 text-yellow-500" />} />
      </div>

      {/* Visual Indicator: Success Bar */}
      <div className="glass-card p-6 rounded-3xl border border-white/5">
        <div className="flex justify-between items-end mb-4 px-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Distribución de Resultados</p>
           <p className="text-xs font-mono text-neon-green">{stats.won}W / {stats.lost}L</p>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
          <div className="bg-neon-green h-full shadow-[0_0_15px_rgba(0,255,135,0.5)]" style={{ width: `${stats.winRate}%` }} />
          <div className="bg-red-500/50 h-full" style={{ width: `${100 - stats.winRate}%` }} />
        </div>
        <div className="mt-4 flex justify-between text-[9px] font-black uppercase tracking-tighter text-white/20 px-2">
           <span>0% Fracaso</span>
           <span>100% Dominio</span>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 text-white/40">
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <p className="text-2xl font-black italic tracking-tighter text-white">{value}</p>
    </div>
  );
}
