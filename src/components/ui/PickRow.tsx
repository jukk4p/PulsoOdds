"use client";

import { useState } from "react";
import { cn, translateBettingTerm } from "@/lib/utils";
import { Trophy, Clock, Zap, Activity, ChevronDown, ChevronUp, Circle, AlertTriangle, List, TrendingUp } from "lucide-react";

interface PickRowProps {
  pick: {
    sport: string;
    competition: string;
    match: string;
    market: string;
    pick: string;
    odds: number;
    stake: number;
    status: string;
    match_date: string;
    analysis?: string;
    alertas?: string;
    factores?: string;
    ev?: number;
    kickoff?: string;
    confianza?: number;
  };
}

export function PickRow({ pick }: PickRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sportConfig: Record<string, { color: string, icon: any }> = {
    football: { color: "text-neon-green", icon: Trophy },
    basketball: { color: "text-orange-500", icon: Activity },
    default: { color: "text-neon-green", icon: Zap }
  };

  const config = sportConfig[pick.sport.toLowerCase()] || sportConfig.default;
  const matchDate = new Date(pick.match_date);
  const formattedTime = pick.kickoff || matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const parseJsonList = (text: string | null | undefined) => {
    if (!text) return [];
    try {
      // Intentamos parsear por si es un JSON array
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      return [text];
    } catch {
      // Si falla, es texto plano; intentamos limpiar posibles restos de formato
      return text.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
    }
  };

  const statusColors = {
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    won: "text-neon-green bg-neon-green/10 border-neon-green/20",
    lost: "text-red-500 bg-red-500/10 border-red-500/20",
    void: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };

  return (
    <div className="group border-b border-white/5 hover:bg-white/[0.02] transition-all">
      <div className="flex flex-col md:flex-row items-center py-4 px-4 gap-4">
        
        {/* Time & Sport */}
        <div className="flex items-center gap-4 min-w-[100px]">
          <div className="flex flex-col items-center">
             <span className="text-sm font-black text-white">{formattedTime}</span>
             <config.icon className={cn("h-4 w-4 mt-1", config.color)} />
          </div>
          <div className={cn("hidden md:block h-8 w-[1px] bg-white/10")} />
        </div>

        {/* Match & Comp */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <h4 className="text-base font-bold text-white group-hover:text-neon-green transition-colors truncate">
            {pick.match}
          </h4>
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium truncate block">
            {pick.competition}
          </span>
        </div>

        {/* Selection & Market */}
        <div className="flex flex-col items-center md:items-end w-full md:w-[200px] shrink-0">
           <span className="text-[10px] text-white/30 uppercase font-bold mb-0.5 truncate max-w-full">
             {translateBettingTerm(pick.market)}
           </span>
           <span className={cn("text-xs font-black uppercase tracking-wider truncate max-w-full", pick.sport.toLowerCase() === 'basketball' ? 'text-orange-500' : 'text-neon-green')}>
             {translateBettingTerm(pick.pick)}
           </span>
        </div>

        {/* Odds Button-like */}
        <div className="w-full md:w-[140px] shrink-0 flex items-center gap-1">
          {/* Reserved space for EV to maintain alignment */}
          <div className="w-[35px] hidden lg:flex flex-col items-center justify-center shrink-0">
            {pick.ev != null && pick.ev > 0 && (
              <>
                <span className="text-[8px] text-neon-green font-black animate-pulse">+EV</span>
                <TrendingUp className="h-3 w-3 text-neon-green" />
              </>
            )}
          </div>
          <div className="flex-1 bg-neon-green/10 border border-neon-green/20 px-3 py-2 rounded-lg flex flex-col items-center justify-center h-full">
            <span className="text-[9px] text-neon-green/60 uppercase font-black">CUOTA</span>
            <span className="text-lg font-black text-neon-green italic">@{pick.odds.toFixed(2)}</span>
          </div>
        </div>

        {/* Stake & Status */}
        <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[160px] justify-between md:justify-end">
           <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider", statusColors[pick.status as keyof typeof statusColors])}>
              {pick.status === 'pending' ? 'Pendiente' : pick.status === 'won' ? 'Ganada' : 'Perdida'}
           </div>
           
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
           >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
           </button>
        </div>
      </div>

      {/* Analysis Expansion */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid md:grid-cols-3 gap-4">
            
             {/* Main Analysis */}
             <div className="md:col-span-2 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-6 mb-4">
                   {/* Confianza Bar */}
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full shadow-[0_0_10px_rgba(0,255,135,0.3)]", pick.sport.toLowerCase() === 'basketball' ? 'bg-orange-500' : 'bg-neon-green')}
                           style={{ width: `${(pick.confianza || 0)}%` }}
                         />
                      </div>
                      <span className="text-[10px] text-white/40 uppercase font-bold text-nowrap">Confianza: {pick.confianza || 0}%</span>
                   </div>

                   {/* Stake Units */}
                   <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                      <Zap className={cn("h-3 w-3", pick.sport.toLowerCase() === 'basketball' ? 'text-orange-500' : 'text-neon-green')} />
                      <span className="text-[10px] text-white/40 uppercase font-bold text-nowrap">Stake: <span className="text-white">{pick.stake || 0}/10</span></span>
                   </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {pick.analysis || "No hay análisis detallado disponible para este pronóstico."}
                </p>
             </div>

             {/* Factors & Alerts */}
             <div className="space-y-4">
                {pick.factores && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-neon-green">
                      <List className="h-3 w-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Factores Clave</span>
                    </div>
                    <ul className="space-y-1">
                      {parseJsonList(pick.factores).map((f, i) => (
                        <li key={i} className="text-[11px] text-white/60 leading-tight flex gap-1.5">
                          <span className="text-neon-green/40">•</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {pick.alertas && (
                  <div className="bg-neon-green/5 border border-neon-green/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-neon-green">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Alertas</span>
                    </div>
                    <ul className="space-y-1">
                      {parseJsonList(pick.alertas).map((a, i) => (
                        <li key={i} className="text-[11px] text-neon-green/80 leading-tight font-medium flex gap-1.5">
                          <span className="text-red-500/50">!</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pick.ev != null && (
                   <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                      <span className="text-[9px] text-white/30 uppercase font-bold">Valor Estimado (EV)</span>
                      <span className={cn("text-xs font-black", pick.ev > 0 ? "text-neon-green" : "text-red-500")}>
                        {pick.ev > 0 ? '+' : ''}{pick.ev.toFixed(2)}%
                      </span>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
