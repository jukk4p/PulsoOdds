"use client";

import { useState } from "react";
import { cn, translateBettingTerm, formatTeamName, normalizeOdds, normalizeBettingPick, translateLeagueName, getLeagueLogo } from "@/lib/utils";
import { Zap, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";

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
}

interface MatchGroupProps {
  picks: Pick[];
  selectedPickIds?: string[];
  onTogglePick?: (id: string) => void;
}

export function MatchGroup({ picks, selectedPickIds = [], onTogglePick }: MatchGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const firstPick = picks[0];
  
  const matchDate = new Date(firstPick.match_date);
  const formattedTime = firstPick.kickoff || matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedDateFull = matchDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
    .replace('.', '').replace(/^\w/, (c) => c.toUpperCase());

  const [homeRaw, awayRaw] = (firstPick.match || "").split(/\s+vs\s+/i);
  const homeName = formatTeamName(homeRaw || "Local");
  const awayName = formatTeamName(awayRaw || "Visitante");

  return (
    <div className="group relative flex flex-col w-full mb-2 transition-all duration-500 px-4 md:px-0">
      <div className={cn(
        "relative flex flex-col w-full rounded-[20px] overflow-hidden transition-all duration-300",
        "bg-[#12141c]/40 backdrop-blur-md",
        "border border-white/5 shadow-xl",
        isExpanded && "bg-[#12141c]/60 border-white/10"
      )}>
        
        {/* HEADER: EVENT INFO */}
        <div className="flex flex-col md:grid md:grid-cols-[180px_1fr_140px] items-stretch md:items-center px-3 md:px-6 py-2 md:py-3 border-b border-white/[0.03] bg-white/[0.01] gap-2 md:gap-0">
          
          {/* MOBILE HEADER BAR: League Only */}
          <div className="md:hidden flex items-center justify-start w-full mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/90 flex items-center justify-center p-0.5 shadow-sm shrink-0">
                <img src={getLeagueLogo(firstPick.competition, firstPick.competition_logo)} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em] truncate max-w-[150px] leading-none mt-[1px]">
                {translateLeagueName(firstPick.competition).split(' - ').pop()}
              </span>
            </div>
          </div>

          {/* DESKTOP COL 1: League (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center p-1.5 shadow-lg shrink-0">
              <img src={getLeagueLogo(firstPick.competition, firstPick.competition_logo)} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mt-[1px]">
                {translateLeagueName(firstPick.competition).split(' - ').pop()}
              </span>
            </div>
          </div>

          {/* COL 2: Teams Center */}
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end min-w-0">
              <span className="text-[10px] md:text-sm font-black uppercase text-white/80 tracking-tight text-right truncate max-w-[70px] md:max-w-none">
                {homeName}
              </span>
              <img src={firstPick.home_logo} alt="" className="h-6 w-6 md:h-9 md:w-9 object-contain filter brightness-90 grayscale-[0.2] shrink-0" />
            </div>
            <div className="flex flex-col items-center justify-center shrink-0 mx-1 md:mx-2">
              <span className="text-[8px] md:text-[9px] font-black text-white/10 italic leading-none mb-1.5">VS</span>
              <div className="flex h-4 md:h-5 items-center gap-1 px-1.5 md:px-2 rounded bg-white/5 border border-white/5">
                <Clock size={8} className="text-white/40" />
                <span className="text-[9px] md:text-[10px] font-bold text-white/60 tabular-nums leading-none mt-[1px]">
                  {formattedTime}
                </span>
              </div>
              <span className="text-[7px] md:text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1.5">
                {formattedDateFull}
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-1 justify-start min-w-0">
              <img src={firstPick.away_logo} alt="" className="h-6 w-6 md:h-9 md:w-9 object-contain filter brightness-90 grayscale-[0.2] shrink-0" />
              <span className="text-[10px] md:text-sm font-black uppercase text-white/80 tracking-tight text-left truncate max-w-[70px] md:max-w-none">
                {awayName}
              </span>
            </div>
          </div>

          {/* COL 3: Compact Action Toggle */}
          <div className="flex items-center justify-center md:justify-end">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "group/btn relative flex items-center gap-2.5 px-4 py-1.5 rounded-full transition-all duration-500",
                "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-neon-green/20",
                isExpanded && "bg-white/[0.05] border-white/10"
              )}
            >
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-neon-green/10 border border-neon-green/20 group-hover/btn:border-neon-green/40 transition-colors">
                <span className="text-[8px] font-black text-neon-green leading-none">{picks.length}</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/30 group-hover/btn:text-white/60 transition-colors">
                {isExpanded ? "Ocultar" : "Pronósticos"}
              </span>
              <div className={cn("text-white/10 group-hover/btn:text-white/40 transition-all duration-500", isExpanded && "rotate-180")}>
                <ChevronDown size={10} />
              </div>
            </button>
          </div>
        </div>

        {/* SELECTIONS LIST */}
        {isExpanded && (
          <div className="flex flex-col divide-y divide-white/[0.02] animate-in fade-in slide-in-from-top-1 duration-300">
            {picks.map((pick) => (
              <SelectionRow 
                key={pick.id} 
                pick={pick} 
                isSelected={selectedPickIds.includes(pick.id)}
                onToggle={() => onTogglePick?.(pick.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectionRow({ pick, isSelected, onToggle }: { pick: Pick, isSelected: boolean, onToggle: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const confidenceValue = pick.confianza || pick.stake * 10;
  const isTopPick = (normalizeOdds(pick.odds) >= 1.50) && (confidenceValue >= 85);

  return (
    <div className="flex flex-col w-full">
      <div 
        className={cn(
          "flex items-center justify-between px-3 md:px-6 py-1.5 md:py-3 transition-all cursor-pointer group/row",
          isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.01]"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <div className={cn(
            "w-0.5 h-5 md:h-6 rounded-full transition-all duration-300 shrink-0",
            isTopPick ? "bg-neon-green/60 shadow-[0_0_10px_rgba(0,255,135,0.2)]" : "bg-white/5",
            isSelected && "bg-neon-green/80 shadow-[0_0_15px_rgba(0,255,135,0.4)]"
          )} />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] md:text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mb-0.5">
              {translateBettingTerm(pick.market || "Pick")}
            </span>
            <div className="flex items-center gap-1.5 md:gap-3">
              <span className="text-[11px] md:text-sm font-black text-white/80 uppercase tracking-tight italic truncate">
                {normalizeBettingPick(pick.pick, pick.match)}
              </span>
              {isTopPick && (
                <span className="text-[5px] md:text-[7px] font-black text-neon-green/60 uppercase tracking-[0.2em] shrink-0">
                  Top Pick
                </span>
              )}
            </div>
          </div>
        </div>



        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={cn(
              "relative flex flex-col items-center justify-center min-w-[54px] md:min-w-[80px] h-8 md:h-12 rounded-lg md:rounded-xl transition-all duration-300 border tabular-nums",
              isSelected 
                ? "bg-neon-green border-neon-green shadow-[0_0_15px_rgba(0,255,135,0.2)]" 
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-neon-green/30"
            )}
          >
            <span className={cn(
              "text-[12px] md:text-[18px] font-black tracking-tighter leading-none transition-colors",
              isSelected ? "text-deep-black" : "text-neon-green"
            )}>
              {normalizeOdds(pick.odds).toFixed(2)}
            </span>
            {isSelected && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green border border-deep-black"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 md:px-8 pb-5 md:pb-6 pt-1 animate-in fade-in duration-300">
          <div className="bg-white/[0.01] rounded-xl p-4 md:p-5 border border-white/[0.03]">
            <div className="flex items-center justify-between mb-3 border-b border-white/[0.03] pb-2">
              <div className="flex items-center gap-2 text-white/40">
                <Zap size={10} className="text-neon-green/60" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Análisis Técnico</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-tighter">Stake</span>
                  <span className="text-[10px] font-black text-neon-green italic leading-none">{pick.stake}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-tighter">Confianza</span>
                  <span className="text-[10px] font-black text-neon-green italic leading-none">{confidenceValue}%</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-white/40 leading-relaxed italic font-medium">
              {pick.razonamiento || "Análisis técnico de alta fidelidad."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
