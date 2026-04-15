"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Circle, ChevronDown, ChevronUp, Trophy, Zap } from "lucide-react";

interface PickCardProps {
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

export function PickCard({ pick }: PickCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    won: "text-neon-green bg-neon-green/10 border-neon-green/20",
    lost: "text-red-500 bg-red-500/10 border-red-500/20",
    void: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'won': return 'Ganada';
      case 'lost': return 'Perdida';
      default: return status;
    }
  };

  return (
    <div className="glass-card neon-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,135,0.15)] group">
      <div className="p-6">
        {/* Header: Sport & Status */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-neon-green uppercase tracking-widest bg-neon-green/10 px-2 py-1 rounded">
              {pick.sport}
            </span>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
              {pick.competition}
            </span>
          </div>
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", statusColors[pick.status as keyof typeof statusColors])}>
            <Circle className="h-1.5 w-1.5 fill-current" />
            {getStatusLabel(pick.status)}
          </div>
        </div>

        {/* Match Title */}
        <h3 className="text-xl font-bold text-white mb-6 group-hover:text-neon-green transition-colors leading-tight">
          {pick.match}
        </h3>

        {/* Odds & Market Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group/item">
             <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
             <p className="text-[10px] text-white/30 uppercase font-black mb-1 relative z-10">Cuota</p>
             <p className="text-2xl font-black text-white italic relative z-10">@{pick.odds.toFixed(2)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group/item">
             <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
             <p className="text-[10px] text-white/30 uppercase font-black mb-1 relative z-10">Selección</p>
             <p className="text-sm font-bold text-neon-green text-center line-clamp-1 relative z-10">{pick.pick}</p>
          </div>
        </div>

        {/* Market & Stake Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
             <div>
                <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Mercado</p>
                <p className="text-sm text-white/80 font-medium">{pick.market}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Confianza</p>
                <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neon-green shadow-[0_0_10px_rgba(0,255,135,0.5)]" 
                        style={{ width: `${(pick.stake / 10) * 100}%` }}
                      />
                   </div>
                   <span className="text-xs font-black text-white">{pick.stake}/10</span>
                </div>
             </div>
          </div>
        </div>

        {/* Analysis Section */}
        {pick.analysis && (
          <div className="mt-6 pt-5 border-t border-white/5">
            <div 
              className={cn(
                "text-sm text-white/60 leading-relaxed italic transition-all duration-500 overflow-hidden",
                isExpanded ? "max-h-[1000px] opacity-100" : "max-h-12 opacity-40"
              )}
            >
              "{pick.analysis}"
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-neon-green hover:text-white transition-colors"
            >
              {isExpanded ? (
                <>Ver menos <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Leer análisis completo <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
