"use client";

import { useState } from "react";
import { cn, translateBettingTerm } from "@/lib/utils";
import { Circle, ChevronDown, ChevronUp, Trophy, Zap, Activity } from "lucide-react";

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

  const sportConfig: Record<string, { color: string, icon: any, label: string }> = {
    football: { 
      color: "text-neon-green border-neon-green/20 bg-neon-green/10", 
      icon: Trophy,
      label: "Fútbol"
    },
    basketball: { 
      color: "text-orange-500 border-orange-500/20 bg-orange-500/10", 
      icon: Activity, // Usamos Activity como fallback vibrante para Basket
      label: "NBA / Basket"
    },
    default: { 
      color: "text-neon-green border-neon-green/20 bg-neon-green/10", 
      icon: Zap,
      label: pick.sport 
    }
  };

  const config = sportConfig[pick.sport.toLowerCase()] || sportConfig.default;

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
            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest", config.color)}>
              <config.icon className="h-3 w-3" />
              {config.label}
            </div>
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
             <p className={cn("text-sm font-bold text-center line-clamp-1 relative z-10", pick.sport.toLowerCase() === 'basketball' ? 'text-orange-500' : 'text-neon-green')}>
               {translateBettingTerm(pick.pick)}
             </p>
          </div>
        </div>

        {/* Market & Stake Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
             <div>
                <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Mercado</p>
                <p className="text-sm text-white/80 font-medium">{translateBettingTerm(pick.market)}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Confianza</p>
                <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full shadow-[0_0_10px_rgba(0,255,135,0.5)]", 
                          pick.sport.toLowerCase() === 'basketball' ? 'bg-orange-500' : 'bg-neon-green'
                        )}
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
          <div className="mt-6 pt-5 border-t border-white/5 relative">
            <div 
              className={cn(
                "text-sm text-white/80 leading-relaxed transition-all duration-500 overflow-hidden relative",
                isExpanded ? "max-h-[1000px]" : "max-h-[72px]"
              )}
            >
              {pick.analysis}
              
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
              )}
            </div>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-neon-green hover:text-white transition-colors py-1"
            >
              {isExpanded ? (
                <>Ver menos <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>Leer análisis completo <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
