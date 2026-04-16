"use client";

import { useState } from "react";
import { cn, translateBettingTerm } from "@/lib/utils";
import { Trophy, Clock, Zap, Activity, ChevronDown, ChevronUp, Circle } from "lucide-react";

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
  const formattedTime = matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  
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
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-base font-bold text-white group-hover:text-neon-green transition-colors">
            {pick.match}
          </h4>
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
            {pick.competition}
          </span>
        </div>

        {/* Selection & Market */}
        <div className="flex flex-col items-center md:items-end min-w-[150px]">
           <span className="text-[10px] text-white/30 uppercase font-bold mb-0.5">
             {translateBettingTerm(pick.market)}
           </span>
           <span className={cn("text-xs font-black uppercase tracking-wider", pick.sport.toLowerCase() === 'basketball' ? 'text-orange-500' : 'text-neon-green')}>
             {translateBettingTerm(pick.pick)}
           </span>
        </div>

        {/* Odds Button-like */}
        <div className="bg-neon-green/10 border border-neon-green/20 px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
           <span className="text-[9px] text-neon-green/60 uppercase font-black">CUOTA</span>
           <span className="text-lg font-black text-neon-green italic">@{pick.odds.toFixed(2)}</span>
        </div>

        {/* Stake & Status */}
        <div className="flex items-center gap-4">
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
      {isExpanded && pick.analysis && (
        <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className={cn("h-full", pick.sport.toLowerCase() === 'basketball' ? 'bg-orange-500' : 'bg-neon-green')}
                     style={{ width: `${(pick.stake / 10) * 100}%` }}
                   />
                </div>
                <span className="text-[10px] text-white/40 uppercase font-bold">Confianza: {pick.stake}/10</span>
             </div>
             <p className="text-sm text-white/70 leading-relaxed italic">
               "{pick.analysis}"
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
