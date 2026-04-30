"use client";

import { useState, useEffect } from "react";
import { cn, normalizeOdds, normalizeBettingPick, formatTimeSpain, formatDateSpain, normalizeTeamName } from "@/lib/utils";
import { getTeamLogo, getLeagueLogo } from "@/lib/logos";
import { Zap, Clock, ChevronDown, Calculator } from "lucide-react";
import { BankrollManager } from "../picks/BankrollManager";

interface Pick {
  id: string;
  sport: string;
  competition: string;
  match: string;
  market: string;
  pick: string;
  odds: number;
  stake: number;
  status: string;
  match_date: string;
  kickoff?: string;
  razonamiento?: string;
  home_logo?: string;
  away_logo?: string;
  confianza?: number;
  competition_logo?: string;
  is_top?: boolean;
}

interface MatchGroupProps {
  picks: Pick[];
  selectedPickIds?: string[];
  onTogglePick?: (id: string) => void;
  onOpenAnalysis?: (pick: any) => void;
}

export function MatchGroup({ picks, selectedPickIds = [], onTogglePick, onOpenAnalysis }: MatchGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bankroll, setBankroll] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pulso_bankroll");
    if (saved) setBankroll(Number(saved));

    const handleUpdate = (e: any) => setBankroll(Number(e.detail));
    window.addEventListener("bankroll-updated", handleUpdate);
    return () => window.removeEventListener("bankroll-updated", handleUpdate);
  }, []);

  const firstPick = picks[0];
  
  const formattedTime = formatTimeSpain(firstPick.match_date);
  const formattedDateFull = formatDateSpain(firstPick.match_date)
    .split(',')[1]?.trim() // Sacamos solo el "25 de abril"
    .replace(/^\w/, (c) => c.toUpperCase()) || "";

  const [homeRaw, awayRaw] = (firstPick.match || "").split(/\s+vs\s+/i);
  
  // Logos normalizados
  const homeLogo = getTeamLogo(homeRaw) || firstPick.home_logo;
  const awayLogo = getTeamLogo(awayRaw) || firstPick.away_logo;

  return (
    <div className="flex flex-col w-full mb-3">
      <div className={cn(
        "relative flex flex-col w-full rounded-lg bg-bg-surface border border-border-base transition-all duration-300",
        isExpanded && "border-border-hover bg-bg-surface/80"
      )}>
        
        {/* HEADER: EVENT INFO */}
        <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 py-6 md:py-8 gap-6 md:gap-12">
          
          {/* Team 1 */}
          <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right w-full">
            <div className="flex items-center gap-4">
              <span className="text-sm md:text-base font-display font-black uppercase tracking-tight text-text-primary line-clamp-1">
                {normalizeTeamName(homeRaw)}
              </span>
              {homeLogo && (
                <img src={homeLogo} alt="" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Local</span>
          </div>

          {/* VS & Time */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-text-muted italic mb-3 opacity-30">VS</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-bg-subtle border border-border-base">
              <Clock size={12} className="text-accent" />
              <span className="text-[11px] font-mono font-bold text-text-primary tabular-nums">
                {formattedTime}
              </span>
            </div>
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-3">
              {formattedDateFull}
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left w-full">
            <div className="flex items-center gap-4">
              {awayLogo && (
                <img src={awayLogo} alt="" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
              )}
              <span className="text-sm md:text-base font-display font-black uppercase tracking-tight text-text-primary line-clamp-1">
                {normalizeTeamName(awayRaw)}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Visitante</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-bg-subtle/30 border-t border-border-base">
          <div className="flex items-center gap-2.5">
            {getLeagueLogo(firstPick.competition) && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white p-1 shadow-sm">
                <img 
                  src={getLeagueLogo(firstPick.competition) || ""} 
                  alt="" 
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/80 group-hover:text-accent transition-colors">
              {firstPick.competition.split('-').pop()?.trim()}
            </span>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-3 px-4 py-1.5 rounded-sm transition-all duration-300",
              "bg-bg-subtle border border-border-base hover:border-accent group",
              isExpanded && "border-accent bg-accent/5"
            )}
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-sm bg-accent/10 border border-accent/20">
              <span className="text-[10px] font-black text-accent">{picks.length}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
              {isExpanded ? "Cerrar" : "Picks Disponibles"}
            </span>
            <ChevronDown size={14} className={cn("text-text-muted transition-transform duration-300", isExpanded && "rotate-180 text-accent")} />
          </button>
        </div>

        {/* SELECTIONS LIST */}
        {isExpanded && (
          <div className="flex flex-col divide-y divide-border-base/50 bg-bg-base/20 animate-in fade-in slide-in-from-top-1 duration-300">
            {picks.map((pick) => (
              <SelectionRow 
                key={pick.id} 
                pick={pick} 
                isSelected={selectedPickIds.includes(pick.id)}
                onToggle={() => onTogglePick?.(pick.id)}
                onOpenAnalysis={() => onOpenAnalysis?.(pick)}
                bankroll={bankroll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectionRow({ 
  pick, 
  isSelected, 
  onToggle, 
  onOpenAnalysis,
  bankroll 
}: { 
  pick: Pick, 
  isSelected: boolean, 
  onToggle: () => void, 
  onOpenAnalysis: () => void,
  bankroll: number | null 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const confidenceValue = pick.confianza || pick.stake * 10;
  const isTopPick = pick.is_top || ((normalizeOdds(pick.odds) >= 1.50) && (confidenceValue >= 85));
  const calculatedBet = bankroll ? (bankroll * (pick.stake / 100)).toFixed(2) : null;

  return (
    <div className="flex flex-col w-full">
      <div 
        className={cn(
          "flex items-center justify-between px-6 py-4 transition-all cursor-pointer group/row",
          isSelected ? "bg-accent/5" : "hover:bg-white/[0.02]"
        )}
        onClick={onOpenAnalysis}
      >
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className={cn(
            "w-1 h-6 rounded-full transition-all duration-300 shrink-0",
            isTopPick ? "bg-accent shadow-[0_0_10px_rgba(200,255,0,0.3)]" : "bg-border-base",
            isSelected && "bg-accent"
          )} />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-1.5">
              {normalizeBettingPick(pick.market, pick.match)}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-text-primary uppercase tracking-tight italic line-clamp-1">
                {normalizeBettingPick(pick.pick, pick.match)}
              </span>
              
              {/* STATUS BADGE PÚBLICO - COMPACTO Y LEGIBLE */}
              <div className="flex items-center gap-2">
                {pick.status !== 'pending' ? (
                  <div className={cn(
                    "w-[64px] py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center",
                    pick.status === 'won' ? "bg-[#00ff88] text-black" :
                    pick.status === 'lost' ? "bg-red-600 text-white" :
                    "bg-white/20 text-white"
                  )}>
                    {pick.status === 'won' ? 'GANADO' : pick.status === 'lost' ? 'PERDIDO' : 'NULO'}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-1 py-0.5 rounded-sm bg-white/[0.03] border border-white/10">
                    <span className="relative flex h-1 w-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/20 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1 w-1 bg-white/40"></span>
                    </span>
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-widest italic">Pendiente</span>
                  </div>
                )}

                {isTopPick && pick.status === 'pending' && (
                  <div className="px-1.5 py-0.5 rounded-sm bg-accent/10 border border-accent/20">
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">TOP</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {calculatedBet && Number(calculatedBet) > 0 && (
            <div className="hidden md:flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-black text-accent uppercase tracking-widest">APUESTA SUGERIDA</span>
              <div className="flex items-center gap-1.5 text-text-primary">
                <Calculator className="w-3 h-3 text-accent" />
                <span className="text-xs font-black tabular-nums">
                  {Number(calculatedBet).toLocaleString()}€
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={cn(
              "relative flex flex-col items-center justify-center min-w-[70px] h-11 rounded-sm transition-all duration-300 border tabular-nums group/odds",
              isSelected 
                ? "bg-accent border-accent shadow-[0_0_20px_rgba(200,255,0,0.2)]" 
                : "bg-bg-subtle border-border-base hover:border-accent/50"
            )}
          >
            <span className={cn(
              "text-lg font-mono font-bold tracking-tighter leading-none",
              isSelected ? "text-bg-base" : "text-accent"
            )}>
              {normalizeOdds(pick.odds).toFixed(2)}
            </span>
            {isSelected && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>

    </div>
  );
}

