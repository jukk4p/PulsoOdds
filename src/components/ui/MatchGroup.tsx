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
  created_at: string;
}

interface MatchGroupProps {
  picks: Pick[];
  selectedPickIds?: string[];
  onTogglePick?: (id: string) => void;
  onOpenAnalysis?: (pick: any) => void;
}

export function MatchGroup({ picks, selectedPickIds = [], onTogglePick, onOpenAnalysis }: MatchGroupProps) {
  const firstPick = picks[0];
  
  const formattedTime = formatTimeSpain(firstPick.match_date);
  const [homeRaw, awayRaw] = (firstPick.match || "").split(/\s+vs\s+/i);
  
  // Logo de la liga
  const leagueLogo = getLeagueLogo(firstPick.competition);

  return (
    <div 
      onClick={() => onOpenAnalysis?.(picks)}
      className={cn(
        "group relative flex items-center justify-between px-4 py-4 rounded-xl bg-[#121212] border border-white/[0.03] hover:border-white/10 transition-all duration-300 cursor-pointer"
      )}
    >
      <div className="flex items-center gap-4">
        {/* League Logo Icon */}
        <div className="w-12 h-12 rounded-lg bg-white border border-white/[0.05] flex items-center justify-center p-2.5 shrink-0 overflow-hidden shadow-inner">
          {leagueLogo ? (
            <img src={leagueLogo} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
              <Zap size={16} className="text-zinc-800" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              {normalizeTeamName(homeRaw)} <span className="text-zinc-600 mx-0.5">vs</span> {normalizeTeamName(awayRaw)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase">
            <span>{firstPick.competition.split('-').pop()?.trim()}</span>
            <span className="opacity-30">|</span>
            <span className="tabular-nums">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Badge Section */}
      <div className="flex items-center gap-3">
        <div className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-[10px] font-black text-accent tracking-tight">
            {picks.length} {picks.length === 1 ? "pick" : "picks"}
          </span>
        </div>
        <ChevronDown size={14} className="text-zinc-700 -rotate-90" />
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
                
                {/* REG DATE */}
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm bg-white/[0.03] border border-white/5">
                  <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                    REG: {new Date(pick.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} {new Date(pick.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
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

