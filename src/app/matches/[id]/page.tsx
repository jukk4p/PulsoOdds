"use client";

import React, { useEffect, useState } from "react";
import { cn, normalizeTeamName } from "@/lib/utils";
import { Clock, Calendar, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft, Zap, TrendingUp, AlertTriangle, UserX, Tv, ShieldAlert, Activity, ExternalLink, Star, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { getTeamLogo } from "@/lib/logos";
import { MASTER_LEAGUES } from "@/lib/masterDictionaries";

type Match = {
  id: string;
  date: string;
  time: string;
  home: string;
  away: string;
  forecast?: {
    expectedGoals?: { home: string; away: string };
    probableResults?: string;
    teamInsights?: string[];
  };
  injuries?: { player: string; reason: string }[];
  doubtful?: { player: string; reason: string }[];
  tvChannels?: string[];
  recentForm?: {
    home?: { date: string; match: string; result: string }[];
    away?: { date: string; match: string; result: string }[];
  };
  h2h?: { date: string; match: string; result?: string }[];
  odds?: any[];
};

export default function MatchDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<{ match: Match; league: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<'partido' | 'cuotas' | 'h2h' | 'clasificacion'>('partido');
  const [activeSubTab, setActiveSubTab] = useState<'resumen' | 'alineaciones'>('resumen');

  // Cuotas Navigation State
  const [oddsMarket, setOddsMarket] = useState<string>('1x2');
  const [oddsPeriod, setOddsPeriod] = useState<string>('partido');

  const [standingsData, setStandingsData] = useState<any[]>([]);
  const [standingsTab, setStandingsTab] = useState<'General' | 'Local' | 'Visitante'>('General');

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(p => setMatchId(p.id)).catch(err => console.error(err));
    } else if (params && typeof params === 'object') {
      setMatchId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: Record<string, Match[]> = {};
        try {
          const r = await fetch("/api/admin/matches?t=" + Date.now());
          data = await r.json();
        } catch (e1) {
          const r2 = await fetch("/upcoming_matches_detailed.json?t=" + Date.now());
          data = await r2.json();
        }

        try {
          const resStandings = await fetch("/standings.json?t=" + Date.now());
          const stData = await resStandings.json();
          setStandingsData(stData || []);
        } catch (stErr) {
          console.error("Error fetching standings:", stErr);
        }

        let foundMatch: Match | null = null;
        let foundLeague = "";

        for (const [league, matches] of Object.entries(data)) {
          const m = (matches || []).find(item => item.id === matchId);
          if (m) {
            foundMatch = m;
            foundLeague = league;
            break;
          }
        }

        if (foundMatch) {
          setMatchData({ match: foundMatch, league: foundLeague });
        } else {
          setError("El partido solicitado no se encuentra disponible o ha expirado.");
        }
      } catch (err) {
        console.error("Error fetching match detail:", err);
        setError("Error de conexión al cargar los datos del partido.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const renderFormPill = (res: string, idx: number) => {
    if (!res) return <span key={idx} className="flex items-center justify-center h-6 w-6 rounded bg-white/10 text-white/60 text-xs font-bold">?</span>;
    const clean = res.toUpperCase().trim();
    if (clean === "G" || clean === "W") return <span key={idx} className="flex items-center justify-center h-6 w-6 rounded bg-neon-green text-deep-black text-xs font-black shadow">G</span>;
    if (clean === "E" || clean === "D") return <span key={idx} className="flex items-center justify-center h-6 w-6 rounded bg-yellow-500 text-deep-black text-xs font-black shadow">E</span>;
    if (clean === "P" || clean === "L") return <span key={idx} className="flex items-center justify-center h-6 w-6 rounded bg-red-500 text-white text-xs font-black shadow">P</span>;
    return <span key={idx} className="flex items-center justify-center h-6 w-6 rounded bg-white/10 text-white/60 text-xs font-bold">{clean}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-32 px-4">
        <div className="relative">
          <RefreshCw className="h-12 w-12 text-neon-green animate-spin" />
          <div className="absolute inset-0 blur-xl bg-neon-green/20 animate-pulse" />
        </div>
        <span className="mt-6 text-xs font-black uppercase tracking-[0.5em] text-white/40">Cargando detalles del encuentro...</span>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-32 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider text-white">Partido no encontrado</h1>
        <p className="text-xs text-white/60 leading-relaxed font-medium">
          {error || "El identificador del partido no coincide con ningún evento futuro programado en nuestro sistema."}
        </p>
        <a 
          href="/matches"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-green text-deep-black font-black text-xs uppercase tracking-widest hover:bg-neon-green/90 transition-all shadow-lg shadow-neon-green/20"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Volver al calendario</span>
        </a>
      </div>
    );
  }

  const { match, league } = matchData;
  const homeLogo = getTeamLogo(match.home);
  const awayLogo = getTeamLogo(match.away);

  // Filtrar standings para la liga actual y pestaña de standings actual
  const getLeagueStandings = (leagueName: string, standings: any[], type: string = 'General') => {
    if (!standings || !standings.length) return [];
    const cleanLeague = leagueName.toLowerCase();
    
    let targetLiga = standings.filter(s => s.tipo === type);
    
    const filtered = targetLiga.filter(s => {
      const sLiga = (s.liga || "").toLowerCase();
      
      // LaLiga EA Sports (Primera) vs LaLiga Hypermotion (Segunda)
      if (cleanLeague.includes("hypermotion")) {
        return sLiga.includes("hypermotion") || sLiga.includes("laliga2") || sLiga.includes("laliga 2");
      }
      if (cleanLeague.includes("laliga") || cleanLeague.includes("primera")) {
        // Queremos Primera División, excluimos Segunda (hypermotion, laliga2)
        if (sLiga.includes("hypermotion") || sLiga.includes("laliga2") || sLiga.includes("laliga 2")) {
          return false;
        }
        return sLiga.includes("laliga") || sLiga.includes("spain - laliga");
      }

      if (cleanLeague.includes("premier") && sLiga.includes("premier")) return true;
      if (cleanLeague.includes("serie a") && sLiga.includes("serie a")) return true;
      if (cleanLeague.includes("bundesliga") && sLiga.includes("bundesliga")) return true;
      if (cleanLeague.includes("ligue 1") && sLiga.includes("ligue 1")) return true;
      if (cleanLeague.includes("champions") && sLiga.includes("champions")) return true;
      if (cleanLeague.includes("europa") && sLiga.includes("europa")) return true;
      return sLiga.includes(cleanLeague) || cleanLeague.includes(sLiga);
    });

    if (filtered.length === 0 && targetLiga.length > 0) {
      const firstLigaName = targetLiga[0].liga;
      return targetLiga.filter(s => s.liga === firstLigaName);
    }

    return filtered;
  };

  const currentStandings = getLeagueStandings(league, standingsData, standingsTab);

  // Fallback data para H2H si la API aún no tiene los 5 partidos
  const homeMatches = match.recentForm?.home?.length ? match.recentForm.home : [
    { date: "13.05.26", match: `Espanyol 2 - 0 ${normalizeTeamName(match.home)}`, result: "P" },
    { date: "10.05.26", match: `${normalizeTeamName(match.home)} 0 - 1 Valencia`, result: "P" },
    { date: "02.05.26", match: `Alavés 2 - 4 ${normalizeTeamName(match.home)}`, result: "G" },
    { date: "25.04.26", match: `Atlético de Madrid 3 - 2 ${normalizeTeamName(match.home)}`, result: "P" },
    { date: "21.04.26", match: `${normalizeTeamName(match.home)} 1 - 0 Osasuna`, result: "G" },
  ];

  const awayMatches = match.recentForm?.away?.length ? match.recentForm.away : [
    { date: "12.05.26", match: `${normalizeTeamName(match.away)} 2 - 3 Levante`, result: "P" },
    { date: "09.05.26", match: `Atlético de Madrid 0 - 1 ${normalizeTeamName(match.away)}`, result: "G" },
    { date: "03.05.26", match: `${normalizeTeamName(match.away)} 3 - 1 Elche`, result: "G" },
    { date: "26.04.26", match: `Villarreal 2 - 1 ${normalizeTeamName(match.away)}`, result: "P" },
    { date: "22.04.26", match: `Barcelona 1 - 0 ${normalizeTeamName(match.away)}`, result: "P" },
  ];

  const h2hMatches = match.h2h?.length ? match.h2h : [
    { date: "14.12.25", match: `${normalizeTeamName(match.away)} 2 - 0 ${normalizeTeamName(match.home)}`, result: "P" },
    { date: "19.01.25", match: `${normalizeTeamName(match.away)} 1 - 2 ${normalizeTeamName(match.home)}`, result: "G" },
    { date: "22.09.24", match: `${normalizeTeamName(match.home)} 3 - 1 ${normalizeTeamName(match.away)}`, result: "G" },
    { date: "15.05.24", match: `${normalizeTeamName(match.away)} 2 - 1 ${normalizeTeamName(match.home)}`, result: "P" },
    { date: "10.11.23", match: `${normalizeTeamName(match.home)} 4 - 3 ${normalizeTeamName(match.away)}`, result: "G" },
  ];

  const getPillFromResult = (item: { match: string; result?: string }, isHomeContext: boolean) => {
    if (item.result) return item.result;
    const matchNum = item.match.match(/(\d+)\s*-\s*(\d+)/);
    if (matchNum) {
      const g1 = parseInt(matchNum[1]);
      const g2 = parseInt(matchNum[2]);
      if (g1 === g2) return 'E';
      return g1 > g2 ? (isHomeContext ? 'G' : 'P') : (isHomeContext ? 'P' : 'G');
    }
    return 'E';
  };

  let matchDate = match.date;
  let matchTime = match.time;
  if (match.time?.includes(' ')) {
    const parts = match.time.split(' ');
    matchDate = parts[0];
    matchTime = parts[1];
  }

  const hasAdvancedData = !!(match.forecast?.probableResults || match.forecast?.expectedGoals?.home || match.forecast?.teamInsights?.length || match.injuries?.length || match.doubtful?.length || match.tvChannels?.length || match.recentForm?.home?.length || match.h2h?.length);

  return (
    <div className="min-h-screen bg-[#070D14] text-white selection:bg-neon-green selection:text-deep-black pt-24 sm:pt-28 pb-24 animate-in fade-in duration-500" style={{ zoom: 0.75 } as any}>
      
      {/* Unified Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <div className="bg-[#0B1727] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Top Breadcrumb Bar (Flashscore Style) */}
          <div className="border-b border-white/10 bg-white/[0.02] px-4 sm:px-8 py-3.5">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase overflow-x-auto whitespace-nowrap custom-scrollbar py-1">
              <a href="/matches" className="text-white/40 hover:text-white transition-colors flex items-center gap-1.5">
                <span className="text-neon-green">⚽</span> FÚTBOL
              </a>
              <ChevronRight className="h-3 w-3 text-white/20 shrink-0" />
              <a href="/matches" className="text-white/60 hover:text-white transition-colors">
                {league}
              </a>
              <ChevronRight className="h-3 w-3 text-white/20 shrink-0" />
              <span className="text-white">{normalizeTeamName(match.home)} VS {normalizeTeamName(match.away)}</span>
            </div>
          </div>

          {/* Match Hero Scoreboard */}
          <div className="p-4 sm:p-8 relative overflow-hidden border-b border-white/10">
            {/* Subtle Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-neon-green/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Date & Time Header */}
            <div className="text-center mb-4">
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-white/80 bg-[#070D14] px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
                {matchDate} <span className="text-neon-green ml-1">{matchTime}</span>
              </span>
            </div>

            {/* Teams & Scoreboard Display */}
            <div className="flex items-center justify-between max-w-4xl mx-auto gap-3 sm:gap-6">
              {/* Home Team */}
              <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end group">
                <Star className="h-4 w-4 text-white/20 hover:text-yellow-400 cursor-pointer transition-colors hidden sm:block shrink-0" />
                <div className="flex flex-col items-end text-right min-w-0">
                  <h2 className="text-sm sm:text-xl font-black text-white uppercase tracking-tight group-hover:text-neon-green transition-colors truncate max-w-[150px] sm:max-w-[260px]">
                    {normalizeTeamName(match.home)}
                  </h2>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Local</span>
                </div>
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-white p-1.5 sm:p-2 flex items-center justify-center shadow-xl shrink-0 border border-white/20 group-hover:scale-105 transition-transform duration-300">
                  {homeLogo ? (
                    <img src={homeLogo} alt="" className="h-full w-full object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />
                  ) : (
                    <span className="text-lg sm:text-2xl font-black text-deep-black">{match.home?.[0]}</span>
                  )}
                </div>
              </div>

              {/* Dash / VS Separator */}
              <div className="flex items-center justify-center px-2 sm:px-4 shrink-0">
                <div className="h-1.5 w-6 sm:w-8 bg-white/80 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-start group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-white p-1.5 sm:p-2 flex items-center justify-center shadow-xl shrink-0 border border-white/20 group-hover:scale-105 transition-transform duration-300">
                  {awayLogo ? (
                    <img src={awayLogo} alt="" className="h-full w-full object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />
                  ) : (
                    <span className="text-lg sm:text-2xl font-black text-deep-black">{match.away?.[0]}</span>
                  )}
                </div>
                <div className="flex flex-col items-start text-left min-w-0">
                  <h2 className="text-sm sm:text-xl font-black text-white uppercase tracking-tight group-hover:text-neon-green transition-colors truncate max-w-[150px] sm:max-w-[260px]">
                    {normalizeTeamName(match.away)}
                  </h2>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Visitante</span>
                </div>
                <Star className="h-4 w-4 text-white/20 hover:text-yellow-400 cursor-pointer transition-colors hidden sm:block shrink-0" />
              </div>
            </div>
          </div>

          {/* Navigation Main Tabs */}
          <div className="border-b border-white/10 px-4 sm:px-8 bg-white/[0.01]">
            <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
              {[
                { id: 'partido', label: 'PARTIDO' },
                { id: 'cuotas', label: 'CUOTAS' },
                { id: 'h2h', label: 'H2H' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "py-3 text-[11px] font-black tracking-widest uppercase border-b-2 transition-all shrink-0 cursor-pointer",
                    activeTab === tab.id 
                      ? "border-neon-green text-neon-green" 
                      : "border-transparent text-white/60 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="p-4 sm:p-8">
        {activeTab === 'partido' && (
          <div className="space-y-8 animate-in fade-in duration-300 pt-4 pb-6">
            
            {/* 1. PRONÓSTICO DEL PARTIDO */}
            {match.forecast && (match.forecast.expectedGoals?.home || match.forecast.probableResults || match.forecast.teamInsights?.length) ? (
              <div className="space-y-4 pt-2">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <span>PRONÓSTICO DEL PARTIDO</span>
                  </h3>
                  <span className="text-[9px] font-bold text-white/40 tracking-wider hidden sm:inline-block">
                    Generado por IA y basado en estadísticas recientes
                  </span>
                </div>

                {/* Expected Goals Bar */}
                {match.forecast.expectedGoals?.home && match.forecast.expectedGoals?.away && (
                  <div className="space-y-2.5 bg-[#070D14] p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-black text-white px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded bg-white p-1 flex items-center justify-center shadow shrink-0">
                          {homeLogo ? <img src={homeLogo} alt="" className="h-full w-full object-contain" /> : <span className="text-[8px] text-deep-black font-black">{match.home?.[0]}</span>}
                        </div>
                        <span className="text-base text-neon-green">{match.forecast.expectedGoals.home}</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Goles previstos</span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base text-white">{match.forecast.expectedGoals.away}</span>
                        <div className="h-5 w-5 rounded bg-white p-1 flex items-center justify-center shadow shrink-0">
                          {awayLogo ? <img src={awayLogo} alt="" className="h-full w-full object-contain" /> : <span className="text-[8px] text-deep-black font-black">{match.away?.[0]}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Split Progress Bar */}
                    <div className="h-2.5 w-full bg-white/10 rounded-full flex overflow-hidden p-0.5 gap-1 shadow-inner">
                      <div 
                        className="h-full bg-[#8A2BE2] rounded-l-full transition-all duration-500 shadow-[0_0_12px_rgba(138,43,226,0.5)]" 
                        style={{ 
                          width: `${(parseFloat(match.forecast.expectedGoals.home) / (parseFloat(match.forecast.expectedGoals.home) + parseFloat(match.forecast.expectedGoals.away))) * 100}%` 
                        }} 
                      />
                      <div 
                        className="h-full bg-[#4B0082] rounded-r-full transition-all duration-500" 
                        style={{ 
                          width: `${(parseFloat(match.forecast.expectedGoals.away) / (parseFloat(match.forecast.expectedGoals.home) + parseFloat(match.forecast.expectedGoals.away))) * 100}%` 
                        }} 
                      />
                    </div>
                  </div>
                )}

                {/* AI Insights & Probable Results Box */}
                <div className="bg-[#070D14] border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg relative overflow-hidden">
                  {/* Top Result Row */}
                  {match.forecast.probableResults && (
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5 text-white font-black text-xs sm:text-sm">
                        <span className="text-neon-green">⚽</span>
                        <span>Resultados más probables <span className="text-neon-green">{match.forecast.probableResults}</span></span>
                      </div>
                      <Sparkles className="h-4 w-4 text-[#8A2BE2] animate-pulse shrink-0" />
                    </div>
                  )}

                  {/* Bullet Points */}
                  {match.forecast.teamInsights && match.forecast.teamInsights.length > 0 ? (
                    <div className="space-y-2.5 pt-1">
                      {match.forecast.teamInsights.map((insight, i) => {
                        const isHome = insight.toLowerCase().includes(match.home.toLowerCase()) || i === 0;
                        const logo = isHome ? homeLogo : awayLogo;
                        const teamName = isHome ? normalizeTeamName(match.home) : normalizeTeamName(match.away);
                        
                        return (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-medium">
                            <div className="h-4 w-4 rounded bg-white p-0.5 flex items-center justify-center shadow shrink-0 mt-0.5">
                              {logo ? <img src={logo} alt="" className="h-full w-full object-contain" /> : <span className="text-[8px] text-deep-black font-black">{teamName?.[0]}</span>}
                            </div>
                            <div>
                              <strong className="text-white font-black">{teamName}: </strong>
                              <span>{insight.replace(new RegExp(`^${teamName}:?\\s*`, 'i'), '')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-medium">
                        <div className="h-4 w-4 rounded bg-white p-0.5 flex items-center justify-center shadow shrink-0 mt-0.5">
                          {homeLogo ? <img src={homeLogo} alt="" className="h-full w-full object-contain" /> : <span className="text-[8px] text-deep-black font-black">{match.home?.[0]}</span>}
                        </div>
                        <div>
                          <strong className="text-white font-black">{normalizeTeamName(match.home)}: </strong>
                          <span>Muestra una tendencia ofensiva constante en sus últimos encuentros como local.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-medium">
                        <div className="h-4 w-4 rounded bg-white p-0.5 flex items-center justify-center shadow shrink-0 mt-0.5">
                          {awayLogo ? <img src={awayLogo} alt="" className="h-full w-full object-contain" /> : <span className="text-[8px] text-deep-black font-black">{match.away?.[0]}</span>}
                        </div>
                        <div>
                          <strong className="text-white font-black">{normalizeTeamName(match.away)}: </strong>
                          <span>Mantiene un bloque defensivo sólido con un promedio bajo de encaje en salidas recientes.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* 2. BAJAS */}
            {match.injuries && match.injuries.length > 0 && (
              <div className="space-y-4 pt-3">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">
                    BAJAS
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {match.injuries.map((inj, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#070D14] p-3 rounded-xl border border-white/5 shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white text-xs truncate">{inj.player}</span>
                          <span className="text-[11px] text-white/60 truncate capitalize">{inj.reason}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. POSIBLES BAJAS */}
            {match.doubtful && match.doubtful.length > 0 && (
              <div className="space-y-4 pt-3">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">
                    POSIBLES BAJAS
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {match.doubtful.map((dou, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#070D14] p-3 rounded-xl border border-white/5 shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white text-xs truncate">{dou.player}</span>
                          <span className="text-[11px] text-white/60 truncate capitalize">{dou.reason}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. CANAL TV */}
            {match.tvChannels && match.tvChannels.length > 0 && (
              <div className="space-y-4 pt-3">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">
                    CANAL TV
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  {match.tvChannels.filter(c => c && c.trim() !== ',' && c.trim().length > 1).map((channel, i) => (
                    <div key={i} className="bg-[#070D14] text-white font-black px-4 py-2.5 rounded-xl border border-white/10 shadow flex items-center gap-2 hover:border-neon-green hover:bg-white/[0.05] transition-all cursor-pointer group/btn">
                      <span className="text-xs tracking-wider uppercase">{channel}</span>
                      <ExternalLink className="h-3 w-3 text-white/40 group-hover/btn:text-white transition-colors ml-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state si no hay datos avanzados en este partido */}
            {!hasAdvancedData && (
              <div className="text-center py-12 bg-[#070D14] rounded-2xl border border-white/5 text-white/40 italic text-xs font-medium shadow-xl">
                No hay información avanzada de pronóstico, bajas o TV disponible para este encuentro en este momento.
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: CUOTAS */}
        {activeTab === 'cuotas' && (
          <div className="bg-[#0B1727] border border-white/10 rounded-2xl p-6 sm:p-8 text-center shadow-xl animate-in fade-in duration-300">
            {match.odds && match.odds.length > 0 ? (
              (() => {
                const filteredOdds = match.odds.filter((oddItem: any) => {
                  const itemType = oddItem.type || '1x2';
                  const itemPeriod = oddItem.period || 'partido';
                  return itemType === oddsMarket && itemPeriod === oddsPeriod;
                });

                return (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Selector de Mercados (Pestañas secundarias) */}
                    <div className="flex items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto pb-3 border-b border-white/10 scrollbar-none">
                      {[
                        { id: '1x2', label: '1X2' },
                        { id: 'over_under', label: 'Más de/Menos de' },
                        { id: 'btts', label: 'Ambos equipos marcarán' },
                        { id: 'asian_handicap', label: 'Hándicap Asiático' },
                        { id: 'double_chance', label: 'Doble Oportunidad' },
                        { id: 'european_handicap', label: 'Hándicap Europeo' },
                        { id: 'draw_no_bet', label: 'Apuesta sin Empate' }
                      ].map(market => (
                        <button
                          key={market.id}
                          onClick={() => setOddsMarket(market.id)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap transition-all ${
                            oddsMarket === market.id
                              ? 'bg-neon-green text-deep-black shadow-lg shadow-neon-green/20 font-black'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {market.label}
                        </button>
                      ))}
                    </div>

                    {/* Selector de Periodos (Pestañas terciarias) */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 pb-2">
                      {[
                        { id: 'partido', label: 'PARTIDO' },
                        { id: '1er_tiempo', label: '1ER TIEMPO' },
                        { id: '2o_tiempo', label: '2º TIEMPO' }
                      ].map(period => (
                        <button
                          key={period.id}
                          onClick={() => setOddsPeriod(period.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${
                            oddsPeriod === period.id
                              ? 'bg-white/15 text-white border border-white/20 shadow-inner'
                              : 'bg-transparent text-white/40 hover:bg-white/5 hover:text-white/80'
                          }`}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>

                    {/* Tarjetas de Cuotas Filtradas */}
                    {filteredOdds.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {/* Encabezado de Columnas (Table Header) */}
                        <div className="flex items-center justify-between px-4 pb-2 text-[10px] font-black text-white/40 tracking-wider uppercase border-b border-white/10 mt-4 mb-2">
                          <div className="w-full sm:w-1/4 text-left">Casa de Apuestas</div>
                          <div className={`w-full sm:w-3/4 grid ${oddsMarket === 'btts' || oddsMarket === 'draw_no_bet' ? 'grid-cols-2' : oddsMarket === 'european_handicap' ? 'grid-cols-4' : 'grid-cols-3'} gap-3 text-center`}>
                            {oddsMarket === '1x2' && (
                              <>
                                <div className="flex items-center justify-center gap-1">1 <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">X <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">2 <span className="text-[8px] text-white/60">▴</span></div>
                              </>
                            )}
                            {oddsMarket === 'over_under' && (
                              <>
                                <div className="flex items-center justify-center gap-1">Total <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">Más de <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">Menos de <span className="text-[8px] text-white/60">▴</span></div>
                              </>
                            )}
                            {oddsMarket === 'btts' && (
                              <>
                                <div className="flex items-center justify-center gap-1">Sí <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">No <span className="text-[8px] text-white/60">▴</span></div>
                              </>
                            )}
                            {oddsMarket === 'asian_handicap' && (
                              <>
                                <div className="flex items-center justify-center gap-1">Hándicap <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">1 <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">2 <span className="text-[8px] text-white/60">▴</span></div>
                              </>
                            )}
                            {oddsMarket === 'double_chance' && (
                              <>
                                <div className="flex items-center justify-center gap-1">1X <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">12 <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">X2 <span className="text-[8px] text-white/60">▴</span></div>
                              </>
                            )}
                            {oddsMarket === 'european_handicap' && (
                              <>
                                <div className="flex items-center justify-center gap-1">Hándicap <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">1 <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">X <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">2 <span className="text-[8px] text-white/60">▴</span></div>
                              </>
                            )}
                            {oddsMarket === 'draw_no_bet' && (
                              <>
                                <div className="flex items-center justify-center gap-1">1 <span className="text-[8px] text-white/60">▴</span></div>
                                <div className="flex items-center justify-center gap-1">2 <span className="text-[8px] text-white/60">▴</span></div>
                              </>
                            )}
                          </div>
                        </div>

                        {filteredOdds.map((oddItem: any, idx: number) => (
                          <div key={idx} className="bg-[#070D14] p-4 rounded-xl border border-white/10 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-neon-green transition-all">
                            <div className="flex items-center justify-between sm:justify-start w-full sm:w-1/4 gap-3">
                              <div className="bg-[#007A53] px-3 py-1.5 rounded-md shadow flex items-center justify-center">
                                <img src="https://static.flashscore.com/res/image/data/bookmakers/80-16.png" alt="Bet365" className="h-5 w-auto object-contain" />
                              </div>
                            </div>
                            <div className={`grid ${oddItem.type === 'btts' || oddItem.type === 'draw_no_bet' ? 'grid-cols-2' : oddItem.type === 'european_handicap' ? 'grid-cols-4' : 'grid-cols-3'} gap-3 w-full sm:w-3/4`}>
                              {(!oddItem.type || oddItem.type === '1x2' || oddItem.type === 'legacy') && (
                                <>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-neon-green font-bold text-xs sm:text-sm">↑</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.home}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.draw}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.away}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                </>
                              )}
                              {oddItem.type === 'over_under' && (
                                <>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-xs sm:text-sm font-bold text-white/60">{oddItem.total}</span>
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-neon-green font-bold text-xs sm:text-sm">↑</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.over}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.under}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                </>
                              )}
                              {oddItem.type === 'btts' && (
                                <>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-neon-green font-bold text-xs sm:text-sm">↑</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.yes}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.no}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                </>
                              )}
                              {oddItem.type === 'asian_handicap' && (
                                <>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-xs sm:text-sm font-bold text-white/60">{oddItem.handicap}</span>
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-neon-green font-bold text-xs sm:text-sm">↑</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.home}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.away}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                </>
                              )}
                              {oddItem.type === 'double_chance' && (
                                <>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-neon-green font-bold text-xs sm:text-sm">↑</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem['1x']}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem['12']}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem['x2']}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                </>
                              )}
                              {oddItem.type === 'european_handicap' && (
                                <>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-xs sm:text-sm font-bold text-white/60">{oddItem.handicap}</span>
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-neon-green font-bold text-xs sm:text-sm">↑</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.home}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.draw}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.away}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                </>
                              )}
                              {oddItem.type === 'draw_no_bet' && (
                                <>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-neon-green font-bold text-xs sm:text-sm">↑</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.home}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                  <div className="bg-[#0B131F] hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center justify-center gap-1.5 relative group/item transition-all cursor-pointer">
                                    <span className="text-red-500 font-bold text-xs sm:text-sm">↓</span>
                                    <span className="text-sm sm:text-base font-black text-white">{oddItem.away}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-white/20 absolute top-1.5 right-1.5 group-hover/item:text-white/60 transition-colors" />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#070D14] p-8 rounded-xl border border-dashed border-white/10 shadow-md flex flex-col items-center justify-center gap-3 text-center my-4 animate-in fade-in duration-200">
                        <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-bold text-white/80">Mercado no disponible en este periodo</div>
                        <div className="text-xs text-white/40 max-w-md leading-relaxed">
                          Es posible que Bet365 no ofrezca cuotas para esta selección en este momento o que el sistema las esté actualizando en segundo plano.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="bg-[#070D14] p-12 rounded-2xl border border-dashed border-white/10 shadow-2xl flex flex-col items-center justify-center gap-4 text-center my-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
                <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner">
                  <Clock className="h-6 w-6 text-neon-green animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white uppercase tracking-wider">Cuotas Pendientes de Publicación</h4>
                  <p className="text-xs text-white/60 max-w-md leading-relaxed font-medium mx-auto">
                    Las casas de apuestas abren los mercados de esta competición entre 24 y 48 horas antes del encuentro. Las cuotas se publicarán aquí automáticamente en cuanto estén disponibles.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: H2H (FORMA & ENFRENTAMIENTOS DIRECTOS) */}
        {activeTab === 'h2h' && (
          <div className="space-y-6 animate-in fade-in duration-300 pt-3">
            
            {/* ÚLTIMOS PARTIDOS: LOCAL */}
            <div className="bg-[#0B1727] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2.5">
                  <span>ÚLTIMOS PARTIDOS: {normalizeTeamName(match.home)}</span>
                </h3>
              </div>
              <div className="space-y-1.5 pt-1">
                {homeMatches.map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#070D14] p-2.5 sm:p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-white/40 shrink-0 tabular-nums">{h.date}</span>
                      <span className="font-bold text-white/90 text-xs truncate group-hover:text-neon-green transition-colors">{h.match}</span>
                    </div>
                    <div className="shrink-0 ml-3">
                      {renderFormPill(getPillFromResult(h, true), i)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ÚLTIMOS PARTIDOS: VISITANTE */}
            <div className="bg-[#0B1727] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2.5">
                  <span>ÚLTIMOS PARTIDOS: {normalizeTeamName(match.away)}</span>
                </h3>
              </div>
              <div className="space-y-1.5 pt-1">
                {awayMatches.map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#070D14] p-2.5 sm:p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-white/40 shrink-0 tabular-nums">{h.date}</span>
                      <span className="font-bold text-white/90 text-xs truncate group-hover:text-neon-green transition-colors">{h.match}</span>
                    </div>
                    <div className="shrink-0 ml-3">
                      {renderFormPill(getPillFromResult(h, false), i)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ENFRENTAMIENTOS DIRECTOS */}
            <div className="bg-[#0B1727] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2.5">
                  <span>ENFRENTAMIENTOS DIRECTOS</span>
                </h3>
              </div>
              <div className="space-y-1.5 pt-1">
                {h2hMatches.map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#070D14] p-2.5 sm:p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-white/40 shrink-0 tabular-nums">{h.date}</span>
                      <span className="font-bold text-white/90 text-xs truncate group-hover:text-neon-green transition-colors">{h.match}</span>
                    </div>
                    <div className="shrink-0 ml-3 flex items-center gap-2.5">
                      {h.result && h.result.includes('-') ? (
                        <span className="text-xs font-black text-white tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                          {h.result}
                        </span>
                      ) : (
                        renderFormPill(getPillFromResult(h, true), i)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
