"use client";

import { useState } from "react";
import { cn, translateBettingTerm } from "@/lib/utils";
import { Circle, ChevronDown, ChevronUp, Trophy, Zap, Activity, Clock, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

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

  const statusConfigs = {
    won: { 
      label: "Ganado", 
      color: "text-accent border-accent/20 bg-accent/10", 
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    lost: { 
      label: "Perdido", 
      color: "text-red-500 border-red-500/20 bg-red-500/10", 
      icon: <XCircle className="h-3 w-3" />
    },
    void: { 
      label: "Nulo", 
      color: "text-text-muted border-border-base bg-bg-subtle", 
      icon: <MinusCircle className="h-3 w-3" />
    },
    pending: { 
      label: "Pendiente", 
      color: "text-accent border-accent/20 bg-accent/10", 
      icon: <Clock className="h-3 w-3" />
    },
  };

  const currentStatus = statusConfigs[pick.status as keyof typeof statusConfigs] || statusConfigs.pending;

  const matchDate = new Date(pick.match_date);
  const formattedDate = matchDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  const formattedTime = matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="group relative bg-bg-surface border border-border-base rounded-lg overflow-hidden transition-all duration-500 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(200,255,0,0.05)]">
      {/* Dynamic Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="p-6 md:p-8">
        {/* Header: Status & Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all",
              currentStatus.color
            )}>
              {currentStatus.icon}
              {currentStatus.label}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
              <span>{pick.competition}</span>
              <span className="h-1 w-1 rounded-full bg-border-base" />
              <div className="flex items-center gap-1">
                <span>{formattedDate}</span>
                <span className="opacity-30">|</span>
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Details */}
        <h3 className="text-xl md:text-2xl font-display font-black text-text-primary mb-8 group-hover:text-accent transition-colors leading-tight uppercase tracking-tight">
          {pick.match}
        </h3>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
           <div className="relative bg-bg-base/50 border border-border-base/50 p-4 rounded-sm overflow-hidden group/item">
             <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 relative z-10">Cuota</p>
             <p className="text-2xl font-mono font-black text-accent relative z-10">
               {pick.odds.toFixed(2)}
             </p>
           </div>
           <div className="relative bg-bg-base/50 border border-border-base/50 p-4 rounded-sm overflow-hidden group/item">
             <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 relative z-10">Selección</p>
             <p className={cn(
               "text-sm font-black text-center line-clamp-1 relative z-10 uppercase italic tracking-tight",
               pick.status === 'won' ? 'text-accent' : 'text-text-primary'
             )}>
               {translateBettingTerm(pick.pick)}
             </p>
           </div>
        </div>

        {/* Analysis Section */}
        {pick.analysis && (
          <div className="pt-6 border-t border-border-base">
            <div 
              className={cn(
                "text-xs text-text-secondary leading-relaxed transition-all duration-500 overflow-hidden relative font-medium italic",
                isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {pick.analysis}
            </div>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent transition-colors py-1"
            >
              <Zap size={12} className={cn("transition-colors", isExpanded ? "text-accent" : "text-text-muted")} />
              {isExpanded ? "Ocultar Análisis" : "Ver Análisis Técnico"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
