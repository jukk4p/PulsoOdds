"use client";

import { useState } from "react";
import { cn, translateBettingTerm, formatTeamName, normalizeOdds, normalizeBettingPick } from "@/lib/utils";
import { ChevronDown, ChevronUp, Zap, List, AlertTriangle, TrendingUp, CheckCircle2, XCircle, Clock, MinusCircle, ShieldCheck } from "lucide-react";

interface PickRowProps {
  pick: {
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
    analysis?: string;
    razonamiento?: string;
    alertas?: string;
    factores?: string;
    ev?: number;
    is_verified?: boolean;
    kickoff?: string;
    confianza?: number;
    league_logo?: string;
    home_logo?: string;
    away_logo?: string;
  };
  isSelected?: boolean;
  onToggle?: () => void;
}

export function PickRow({ pick, isSelected, onToggle }: PickRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const matchDate = new Date(pick.match_date);
  const dayName = matchDate.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const dayMonth = matchDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');
  const formattedDay = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayMonth}`;
  const formattedTime = pick.kickoff || matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const [homeRaw, awayRaw] = (pick.match || "").split(/\s+vs\s+/i);
  const homeName = formatTeamName(homeRaw || "Local");
  const awayName = formatTeamName(awayRaw || "Visitante");

  const parseJsonList = (text: string | null | undefined) => {
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      return [text];
    } catch {
      return text.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
    }
  };

  const statusStyles = {
    pending: "text-[#c9a84c] bg-[#c9a84c]/10 border-[#c9a84c]/20",
    won: "text-[#00e676] bg-[#00e676]/10 border-[#00e676]/20",
    lost: "text-red-500 bg-red-500/10 border-red-500/20",
    void: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };

  const statusLabels: Record<string, string> = {
    pending: "PENDIENTE",
    won: "GANADA",
    lost: "PERDIDA",
    void: "NULA",
  };

  const GENERIC_SHIELD = "https://img.icons8.com/ios-filled/100/ffffff/shield.png";
  const GENERIC_LEAGUE = "https://img.icons8.com/ios-filled/100/ffffff/trophy.png";

  const getLocalLogoPath = (url: string | undefined, type: 'leagues' | 'teams') => {
    if (!url || !url.includes('/')) return null;
    const filename = url.split('/').pop();
    return `/logos/${type}/${filename}`;
  };

  return (
    <div className="mb-4">
      {/* Container Principal */}
      <div 
        className={cn(
          "bg-[#111f2e] border border-white/5 rounded-[20px] md:rounded-[10px] overflow-hidden transition-all duration-300 relative shadow-lg",
          (pick.confianza || pick.stake || 5) >= 8 && "border-[#00e676]/20",
          isSelected && "border-[#00e676]/50 bg-slate-900/80"
        )}
      >
        
        {/* ==========================================
            VISTA MÓVIL (GOLDEN DESIGN - COMMIT 62d03bd)
            ========================================== */}
        <div className="md:hidden flex flex-col p-5 space-y-4">
          {/* Header Móvil */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
             <div className="flex items-center gap-3">
                <div className="h-7 w-7 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-sm">
                   <img src={getLocalLogoPath(pick.league_logo, 'leagues') || pick.league_logo || GENERIC_LEAGUE} alt="" className="h-5 w-5 object-contain" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white/50 uppercase tracking-widest truncate">{pick.competition}</span>
                   <span className="text-[8px] font-bold text-white/20 uppercase">{formattedDay} @ {formattedTime}</span>
                </div>
             </div>
             <div className={cn("px-2 py-0.5 rounded-md border text-[8px] font-black uppercase", pick.status === 'pending' ? "text-slate-900 bg-[#c9a84c] border-[#c9a84c]" : statusStyles[pick.status as keyof typeof statusStyles])}>
                {statusLabels[pick.status as keyof typeof statusLabels]}
             </div>
          </div>

          {/* Teams Vertical: Recuperado del Commit 62d03bd */}
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="flex flex-col items-center gap-2 w-full">
              {/* Home */}
              <div className="flex items-center justify-center gap-3 w-full">
                <span className="text-xs font-bold text-white uppercase tracking-tight text-center flex-1">{homeName}</span>
                <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                  <img src={getLocalLogoPath(pick.home_logo, 'teams') || pick.home_logo || GENERIC_SHIELD} alt="" className="h-6 w-6 object-contain" />
                </div>
              </div>
              
              {/* VS */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-[1px] bg-white/5" />
                <span className="text-[9px] font-black italic text-neon-green/40 uppercase">VS</span>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              {/* Away */}
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                  <img src={getLocalLogoPath(pick.away_logo, 'teams') || pick.away_logo || GENERIC_SHIELD} alt="" className="h-6 w-6 object-contain" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-tight text-center flex-1">{awayName}</span>
              </div>
            </div>
          </div>

          {/* Mercado y Cuota */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 bg-slate-900/60 border border-white/10 rounded-2xl p-3 flex flex-col justify-center items-center text-center h-[60px]">
               <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest mb-1">{translateBettingTerm(pick.market || "Hándicap")}</span>
               <span className="text-[12px] font-black uppercase text-[#00e676] italic">{translateBettingTerm(pick.pick)}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onToggle?.(); }} className={cn("w-[75px] h-[60px] rounded-2xl border transition-all flex flex-col items-center justify-center", isSelected ? "bg-[#00e676] border-[#00e676] text-[#0a0f16]" : "bg-neon-green/5 border-neon-green/20 text-[#00e676]")}>
               <span className={cn("text-[8px] font-bold uppercase opacity-30", isSelected ? "text-[#0a0f16]" : "text-white")}>Cuota</span>
               <span className="text-[18px] font-black leading-none">{normalizeOdds(pick.odds).toFixed(2)}</span>
            </button>
          </div>

          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-center gap-2 text-[9px] font-black text-white/10 uppercase tracking-[0.4em] pt-2">
            {isExpanded ? "Ocultar" : "Detalles"} {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* ==========================================
            VISTA ESCRITORIO (HORIZONTE 70PX)
            ========================================== */}
        <div className="hidden md:block">
          {/* Header Técnico */}
          <div className="flex items-center px-8 pt-3 pb-0 gap-6">
            <div className="w-[50px] shrink-0 h-8 pr-4" />
            <div className="flex-[4.6] relative h-8 flex items-center justify-center px-4">
               <div className="flex w-full items-center justify-center opacity-50">
                  <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-white tracking-[0.2em] truncate">{formattedDay}</span>
                    <div className="h-[1px] w-4 bg-white/10 shrink-0" />
                  </div>
                  <div className="shrink-0 px-2 font-black text-neon-green text-[10px] tracking-wider">{formattedTime}</div>
                  <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                    <div className="h-[1px] w-4 bg-white/10 shrink-0" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-[0.1em] truncate">{pick.competition}</span>
                  </div>
               </div>
            </div>
            <div className="flex-[3.2] h-8 flex items-center justify-center px-4">
               <span className="text-[10px] text-white font-bold uppercase tracking-[0.2em] w-full max-w-[185px] text-center opacity-50">Mercado</span>
            </div>
            <div className="w-[80px] shrink-0 h-8" />
            <div className="w-[60px] md:flex-1 flex items-center justify-end gap-5 h-8">
               <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => {
                      const confidenceLevel = (pick.confianza || pick.stake * 10 || 50) / 10;
                      return <div key={i} className={cn("w-0.5 h-2.5 rounded-full transition-all", i < confidenceLevel ? confidenceLevel >= 8 ? "bg-neon-green shadow-sm" : "bg-white/60" : "bg-white/10")} />;
                    })}
                  </div>
                  <span className="text-[7px] font-black uppercase text-white/20 whitespace-nowrap">Confianza</span>
               </div>
               <div className={cn("flex items-center justify-center h-6 md:w-24 rounded-lg border px-2", pick.status === 'pending' ? "text-slate-900 bg-[#c9a84c] border-[#c9a84c]" : statusStyles[pick.status as keyof typeof statusStyles])}>
                  <span className="text-[8px] font-black uppercase tracking-tight">{statusLabels[pick.status as keyof typeof statusLabels]}</span>
               </div>
            </div>
          </div>

          {/* Cuerpo Horizonte 70px - FIXED ALIGNMENT */}
          <div className="flex items-center h-[70px] px-8 gap-6 relative mb-5">
            <div className="flex items-center justify-center w-[50px] shrink-0 h-full">
                <div className="h-9 w-9 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden shadow-sm">
                  <img src={getLocalLogoPath(pick.league_logo, 'leagues') || pick.league_logo || GENERIC_LEAGUE} alt="" className="h-6 w-6 object-contain" />
                </div>
            </div>

            <div className="flex-[4.6] flex items-center justify-center h-full min-w-0">
              <div className="flex items-center justify-center gap-4 w-full">
                <div className="flex flex-1 items-center justify-end gap-3 min-w-0">
                   <span className="text-sm font-bold text-white truncate text-right uppercase tracking-tight">{homeName}</span>
                    <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                      <img src={getLocalLogoPath(pick.home_logo, 'teams') || pick.home_logo || GENERIC_SHIELD} alt="" className="h-6 w-6 object-contain" />
                    </div>
                </div>
                <div className="flex items-center shrink-0">
                   <span className="text-[9px] font-black italic text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-md border border-neon-green/20">VS</span>
                </div>
                <div className="flex flex-1 items-center justify-start gap-3 min-w-0">
                    <div className="h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                      <img src={getLocalLogoPath(pick.away_logo, 'teams') || pick.away_logo || GENERIC_SHIELD} alt="" className="h-6 w-6 object-contain" />
                    </div>
                   <span className="text-sm font-bold text-white truncate text-left uppercase tracking-tight">{awayName}</span>
                </div>
              </div>
            </div>

            <div className="flex-[3.2] flex items-center justify-center h-full min-w-0 pr-12">
              <div className="flex flex-col gap-0.5 items-center bg-slate-900/40 p-2 rounded-xl border border-white/5 w-full max-w-[185px] shadow-inner h-[50px] justify-center">
                <div className="flex flex-col gap-0.5 w-full">
                  <span className="text-[8px] text-white/50 uppercase font-bold italic tracking-wide truncate">{translateBettingTerm(pick.market || "Hándicap")}</span>
                  <span className="text-[11px] font-black uppercase text-[#00e676] leading-tight italic">{translateBettingTerm(pick.pick)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center w-[80px] shrink-0 h-full">
               <button onClick={(e) => { e.stopPropagation(); onToggle?.(); }} className={cn("flex flex-col items-center justify-center w-[70px] h-[50px] rounded-xl border transition-all duration-300 relative overflow-hidden group", isSelected ? "bg-[#00e676] border-[#00e676] text-[#0a0f16] shadow-[0_0_20px_rgba(0,230,118,0.3)] scale-105" : "bg-slate-900 border-white/10 text-[#00e676] hover:border-[#00e676]/50 hover:bg-slate-800")}>
                  {!isSelected && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-50" />}
                  <div className="flex flex-col items-center relative z-10">
                     <span className={cn("text-[8px] font-bold uppercase tracking-[0.1em] mb-0.5 opacity-40", isSelected ? "text-[#0a0f16]" : "text-white")}>Cuota</span>
                     <span className="text-base font-black tracking-tight leading-none">{normalizeOdds(pick.odds).toFixed(2)}</span>
                  </div>
               </button>
            </div>

            <div className="flex items-center justify-center w-[60px] shrink-0 h-full">
               <button onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-transparent hover:bg-white/5 text-white/20 hover:text-neon-green transition-all translate-y-[2px]">
                 {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>
            </div>
          </div>
        </div>

        {/* Análisis Expandido (Común) */}
        {isExpanded && (
          <div className="px-5 md:px-6 pb-6 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 bg-gradient-to-b from-transparent to-white/[0.02]">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
               <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 shadow-sm">
                    <div className="h-2 w-28 md:w-32 bg-slate-800 border border-white/20 rounded-full overflow-hidden relative shadow-inner">
                        <div className="h-full bg-neon-green transition-all duration-700 ease-out" style={{ width: `${pick.confianza || 0}%` }} />
                    </div>
                    <span className="text-[9px] md:text-[10px] text-white/60 uppercase font-black">Confianza: <span className="text-neon-green">{pick.confianza || 0}%</span></span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
                    <Zap size={14} className="text-neon-green" />
                    <span className="text-[9px] md:text-[10px] text-white/40 uppercase font-bold tracking-wider">Stake: <span className="text-white font-black">{pick.stake || 0}/10</span></span>
                  </div>
               </div>
               <div className="relative group max-w-2xl px-4">
                  <p className="text-[13px] md:text-base text-white/80 leading-relaxed font-medium italic relative z-10">
                    {pick.razonamiento || "No hay análisis detallado disponible para esta apuesta."}
                  </p>
               </div>
               <div className="grid md:grid-cols-2 gap-4 md:gap-6 w-full pt-2">
                  {pick.factores && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 text-left">
                      <div className="flex items-center gap-2 mb-3 text-neon-green">
                        <ShieldCheck size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Puntos Fuertes</span>
                      </div>
                      <ul className="space-y-2">
                        {parseJsonList(pick.factores).map((f, i) => (
                          <li key={i} className="text-[10px] md:text-[11px] text-white/60 leading-tight flex gap-3">
                            <span className="text-neon-green shrink-0">✓</span> <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pick.alertas && (
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 md:p-5 text-left">
                      <div className="flex items-center gap-2 mb-3 text-orange-500">
                        <AlertTriangle size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Riesgos</span>
                      </div>
                      <ul className="space-y-2">
                        {parseJsonList(pick.alertas).map((a, i) => (
                          <li key={i} className="text-[10px] md:text-[11px] text-orange-400/80 leading-tight flex gap-3">
                            <span className="shrink-0 text-orange-500">!</span> <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
