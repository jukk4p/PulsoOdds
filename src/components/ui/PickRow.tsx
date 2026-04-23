"use client";

import { useState } from "react";
import { cn, translateBettingTerm, formatTeamName, normalizeOdds, normalizeBettingPick, translateLeagueName } from "@/lib/utils";
import { Zap, ShieldCheck, Calendar, Clock } from "lucide-react";

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
    kickoff?: string;
    analysis?: string;
    razonamiento?: string;
    alertas?: string;
    factores?: string;
    home_logo?: string;
    away_logo?: string;
    confianza?: number;
    competition_logo?: string;
  };
  isSelected?: boolean;
  onToggle?: () => void;
}

const LEAGUE_LOGOS: Record<string, string> = {
  'LaLiga EA Sports': 'https://static.flashscore.com/res/image/data/6aNYx0jD-A3tOPy9B.png',
  'Premier League': 'https://static.flashscore.com/res/image/data/423YHekd-UZ1TZUJe.png',
  'Bundesliga': 'https://static.flashscore.com/res/image/data/fqltz6CO-4ATnefbq.png',
  'Serie A': 'https://static.flashscore.com/res/image/data/rFHMayEO-2exwJQks.png',
  'Ligue 1': 'https://static.flashscore.com/res/image/data/tOAXV6hU-QJIQNuDK.png',
  'Eredivisie': 'https://static.flashscore.com/res/image/data/tUREAsfU-GlPCPH4g.png',
  'LaLiga Hypermotion': 'https://static.flashscore.com/res/image/data/pKR6BlXI-ldSUHsCQ.png',
  'Championship': 'https://static.flashscore.com/res/image/data/4ADJttRp-GEd5kOd6.png',
  '2. Bundesliga': 'https://static.flashscore.com/res/image/data/ryRxh88j-ziwIGcqp.png',
  'Serie B': 'https://static.flashscore.com/res/image/data/4U93rbmd-rTQVhPCF.png',
  'Ligue 2': 'https://static.flashscore.com/res/image/data/IHwVm9ld-G2ORd69c.png'
};

const getLeagueLogo = (competition: string, apiLogo?: string) => {
  if (!competition) return apiLogo || '/logos/placeholder.png';
  const normalizedInput = competition.toLowerCase().trim();
  const cleanName = normalizedInput.includes(':') ? normalizedInput.split(':').pop()?.trim() : normalizedInput;
  
  const logoKey = Object.keys(LEAGUE_LOGOS).find(key => 
    key.toLowerCase() === cleanName || 
    cleanName?.includes(key.toLowerCase()) ||
    key.toLowerCase().includes(cleanName || '')
  );

  if (logoKey) return LEAGUE_LOGOS[logoKey];
  if (normalizedInput.includes('laliga')) return LEAGUE_LOGOS['LaLiga EA Sports'];
  if (normalizedInput.includes('premier')) return LEAGUE_LOGOS['Premier League'];
  if (normalizedInput.includes('ligue 1')) return LEAGUE_LOGOS['Ligue 1'];
  if (normalizedInput.includes('serie a')) return LEAGUE_LOGOS['Serie A'];
  if (normalizedInput.includes('bundesliga')) return LEAGUE_LOGOS['Bundesliga'];
  
  return apiLogo || '/logos/placeholder.png';
};

export function PickRow({ pick, isSelected, onToggle }: PickRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoError, setLogoError] = useState<{ home: boolean, away: boolean }>({ home: false, away: false });

  const matchDate = new Date(pick.match_date);
  const formattedTime = pick.kickoff || matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedDateFull = matchDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
    .replace('.', '')
    .replace(/^\w/, (c) => c.toUpperCase());

  const [homeRaw, awayRaw] = (pick.match || "").split(/\s+vs\s+/i);
  const homeName = formatTeamName(homeRaw || "Local");
  const awayName = formatTeamName(awayRaw || "Visitante");

  const pickLower = pick.pick?.toLowerCase() || "";
  const isHomeSelected = pickLower.includes(homeName.toLowerCase()) || pickLower === "1" || pickLower === "local";
  const isAwaySelected = pickLower.includes(awayName.toLowerCase()) || pickLower === "2" || pickLower === "visitante";

  const statusConfig: Record<string, { label: string, classes: string }> = {
    pending: { label: "Pendiente", classes: "bg-[#432c0b] text-[#f97316] border border-[#f97316]/20" },
    won: { label: "Ganado", classes: "bg-[#14532d] text-[#86efac] border border-[#86efac]/20" },
    lost: { label: "Perdido", classes: "bg-[#450a0a] text-[#fca5a5] border border-[#fca5a5]/20" },
    void: { label: "Nulo", classes: "bg-white/5 text-white/40 border border-white/10" },
  };

  const confidenceValue = pick.confianza || pick.stake * 10;
  const isTopPick = (normalizeOdds(pick.odds) >= 1.50) && (confidenceValue >= 85);

  const TeamLogo = ({ src, name, side, size = "h-8 w-8" }: { src?: string, name: string, side: 'home' | 'away', size?: string }) => {
    const hasError = side === 'home' ? logoError.home : logoError.away;
    return (
      <div className={cn("flex items-center justify-center shrink-0", size)}>
        {!src || hasError ? (
          <div className="rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 w-full h-full">
            {name.charAt(0)}
          </div>
        ) : (
          <img
            src={src}
            alt=""
            className="w-full h-full object-contain filter brightness-110 contrast-110"
            onError={() => setLogoError(prev => ({ ...prev, [side]: true }))}
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "group relative flex flex-col w-full mb-4 transition-all duration-500",
      isTopPick ? "scale-[1.01]" : "hover:scale-[1.005]"
    )}>
      {/* 🌟 SUBTLE GLOW (TOP PICKS ONLY) */}
      {isTopPick && (
        <div className="absolute -inset-[1px] bg-gradient-to-r from-neon-green/20 via-transparent to-neon-green/20 rounded-[22px] blur-[8px] opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
      )}

      <div className={cn(
        "relative flex flex-col w-full rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer select-none",
        "bg-gradient-to-br from-white/[0.05] to-[#0c0e14] backdrop-blur-xl",
        "border border-white/10 shadow-xl",
        isTopPick ? "border-neon-green/10" : "hover:border-white/15",
        isSelected && "ring-1 ring-neon-green/20 bg-white/[0.08]"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      >
        
        {/* ━━━ DESKTOP LAYOUT (SYMMETRIC ELITE GRID) ━━━ */}
        <div className="hidden md:grid grid-cols-[140px_1fr_320px_110px] items-center min-h-[130px]">
          
          {/* LEAGUE INFO & DATE (COL 1) */}
          <div className="flex flex-col items-center justify-center h-full border-r border-white/5 bg-white/[0.01] px-4 py-6 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-xl shadow-white/5 ring-2 ring-white/10">
                <img 
                  src={getLeagueLogo(pick.competition, pick.competition_logo)} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] text-center leading-tight">
                {translateLeagueName(pick.competition).split(' - ').pop()}
              </span>
            </div>

            <div className="h-px w-8 bg-white/10" />

            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <Calendar size={11} className="text-neon-green/50" />
                <span className="text-[10px] font-black text-white/50 italic uppercase tracking-wider">
                  {formattedDateFull}
                </span>
              </div>
              <div className="flex items-center gap-2 translate-y-[0.5px]">
                <Clock size={11} className="text-neon-green/50" />
                <span className="text-[10px] font-black text-white/40 tabular-nums italic">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* TEAMS SYMMETRIC (COL 2) */}
          <div className="flex flex-col gap-3 px-8">
            <div className="grid grid-cols-[1fr_auto_40px_auto_1fr] items-center gap-5">
              <div className="text-right truncate">
                <span className={cn("text-[14px] font-black uppercase tracking-tight transition-colors", isHomeSelected ? "text-neon-green" : "text-white/90")}>
                  {homeName}
                </span>
              </div>
              <TeamLogo src={pick.home_logo} name={homeName} side="home" size="h-9 w-9" />
              <span className="text-[10px] font-black text-white/10 text-center italic uppercase">VS</span>
              <TeamLogo src={pick.away_logo} name={awayName} side="away" size="h-9 w-9" />
              <div className="text-left truncate">
                <span className={cn("text-[14px] font-black uppercase tracking-tight transition-colors", isAwaySelected ? "text-neon-green" : "text-white/90")}>
                  {awayName}
                </span>
              </div>
            </div>
          </div>

          {/* MARKET & SELECTION (COL 3) */}
          <div className="px-6 flex justify-center">
            <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 py-4 px-6 rounded-2xl w-full">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">
                {translateBettingTerm(pick.market || "Pick")}
              </span>
              <span className="text-base font-black text-neon-green italic leading-none truncate uppercase tracking-wide">
                {normalizeBettingPick(pick.pick, pick.match)}
              </span>
              <div className="flex gap-1.5 mt-4">
                {[1,2,3,4,5].map((s) => (
                  <div key={s} className={cn("h-1 w-5 rounded-full", s <= Math.ceil(confidenceValue / 20) ? "bg-neon-green/50" : "bg-white/5")} />
                ))}
              </div>
            </div>
          </div>

          {/* ODDS & CTA (COL 4) */}
          <div className="flex flex-col items-center justify-center border-l border-white/5 h-full px-4 gap-2">
             <div className="h-3 flex items-center">
                {isTopPick && (
                  <span className="text-[8px] font-black text-neon-green uppercase tracking-[0.4em] animate-pulse">
                    Top
                  </span>
                )}
              </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
              className={cn(
                "h-14 w-full rounded-xl font-black text-2xl transition-all duration-300",
                isSelected
                  ? "bg-white text-deep-black shadow-lg"
                  : "bg-neon-green text-deep-black shadow-[0_4px_16px_rgba(0,255,135,0.25)] hover:scale-105 active:scale-95"
              )}
            >
              {normalizeOdds(pick.odds).toFixed(2)}
            </button>
          </div>
        </div>

        {/* ━━━ MOBILE LAYOUT ━━━ */}
        <div className="md:hidden flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/[0.04] border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-lg ring-1 ring-white/10">
                <img 
                  src={getLeagueLogo(pick.competition, pick.competition_logo)} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
                {translateLeagueName(pick.competition).split(' - ').pop()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isTopPick && <span className="text-[8px] font-black text-neon-green uppercase tracking-[0.4em] animate-pulse">Top</span>}
              <div className="flex items-center gap-3 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} className="text-neon-green/50" />
                  <span className="text-[9px] font-bold text-white/50 tabular-nums italic uppercase">
                    {formattedDateFull.split(',')[1]?.trim() || formattedDateFull}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={10} className="text-neon-green/50" />
                  <span className="text-[10px] font-black text-white/90 tabular-nums tracking-tighter italic">
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-8">
            {/* Mobile Teams Block */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <TeamLogo src={pick.home_logo} name={homeName} side="home" size="h-9 w-9" />
                <span className={cn("text-base font-black uppercase tracking-tight", isHomeSelected ? "text-neon-green" : "text-white/90")}>
                  {homeName}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <TeamLogo src={pick.away_logo} name={awayName} side="away" size="h-9 w-9" />
                <span className={cn("text-base font-black uppercase tracking-tight", isAwaySelected ? "text-neon-green" : "text-white/90")}>
                  {awayName}
                </span>
              </div>
            </div>

            {/* Mobile Action Row */}
            <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5">
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5">
                  {translateBettingTerm(pick.market || "Pick")}
                </span>
                <span className="text-sm font-black text-neon-green italic leading-none truncate uppercase tracking-wide">
                  {normalizeBettingPick(pick.pick, pick.match)}
                </span>
                <div className="flex gap-1 mt-3">
                  {[1,2,3,4,5].map((s) => (
                    <div key={s} className={cn("h-1 w-3 rounded-full", s <= Math.ceil(confidenceValue / 20) ? "bg-neon-green/40" : "bg-white/5")} />
                  ))}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                className={cn(
                  "h-12 px-6 rounded-xl font-black text-xl transition-all duration-300 shrink-0",
                  isSelected
                    ? "bg-white text-deep-black shadow-lg"
                    : "bg-neon-green text-deep-black shadow-[0_4px_12px_rgba(0,255,135,0.2)] active:scale-95"
                )}
              >
                {normalizeOdds(pick.odds).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* ━━━ EXPANDED CONTENT ━━━ */}
        {isExpanded && (
          <div className="p-8 border-t border-white/10 bg-white/[0.02] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-3 text-neon-green">
                  <Zap size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Razonamiento Pro</span>
                </div>
                <p className="text-base text-white/70 leading-relaxed italic font-medium">
                  {pick.razonamiento || "Nuestro algoritmo y expertos han analizado este mercado buscando el máximo valor basado en tendencias recientes."}
                </p>
              </div>
              <div className="md:w-1/3 space-y-6">
                <div className="flex items-center gap-3 text-white/30">
                  <ShieldCheck size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Métricas de Éxito</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner group/stat">
                    <span className="block text-[9px] text-white/20 uppercase font-black tracking-widest mb-2 group-hover/stat:text-white/40 transition-colors">Confianza</span>
                    <span className="text-2xl font-black text-neon-green">{confidenceValue}%</span>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner">
                    <span className="block text-[9px] text-white/20 uppercase font-black tracking-widest mb-2">Stake</span>
                    <span className="text-2xl font-black text-white">{pick.stake}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
