"use client";
import { supabase } from "@/lib/supabase";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { cn, normalizeTeamName } from "@/lib/utils";
import { Clock, Calendar, RefreshCw, AlertCircle, CheckCircle2, ChevronDown, Filter, Star, ExternalLink } from "lucide-react";
import { getTeamLogo } from "@/lib/logos";
import { MASTER_LEAGUES } from "@/lib/masterDictionaries";

const LEAGUES = [
  "LaLiga EA Sports",
  "Premier League",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Eredivisie",
  "Liga Portugal",
  "LaLiga Hypermotion",
  "Championship",
  "2. Bundesliga",
  "Serie B",
  "Ligue 2",
  "Serie A Betano / Brasil",
  "MLS",
  "Mundial",
];

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
};

const isPastMatch = (dateStr: string) => {
  if (!dateStr) return false;
  const clean = dateStr.replace(/[^\d.]/g, '');
  const parts = clean.split('.').filter(Boolean).map(Number);
  if (parts.length < 2) return false;
  const matchDay = parts[0];
  const matchMonth = parts[1];
  
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  
  if (matchMonth < currentMonth) return true;
  if (matchMonth === currentMonth && matchDay < currentDay) return true;
  return false;
};

export default function AdminMatchesPage() {
  const [allData, setAllData] = useState<Record<string, Match[]>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({
    "LaLiga EA Sports": true,
    "Premier League": true,
  });

  const toggleLeague = (league: string) => {
    setExpandedLeagues(prev => ({ ...prev, [league]: !prev[league] }));
  };

  const [starredLeagues, setStarredLeagues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("starredLeagues");
      if (saved) setStarredLeagues(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleStarLeague = (league: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredLeagues(prev => {
      const next = { ...prev, [league]: !prev[league] };
      try {
        localStorage.setItem("starredLeagues", JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  const sortedLeagues = useMemo(() => {
    return [...LEAGUES].sort((a, b) => {
      const aStarred = !!starredLeagues[a];
      const bStarred = !!starredLeagues[b];
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;
      return LEAGUES.indexOf(a) - LEAGUES.indexOf(b);
    });
  }, [starredLeagues]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/matches?t=" + Date.now());
      const data = await r.json();
      setAllData(data);
    } catch (err) {
      console.error("Error loading matches:", err);
      setAllData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runSync = async () => {
    setSyncing(true);
    setNotification(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/sync-matches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ })
      });
      const data = await res.json();
      if (data.success) {
        const nowStr = new Date().toLocaleTimeString();
        setLastSyncTime(nowStr);
        setNotification({ type: 'success', message: `¡Partidos actualizados con éxito a las ${nowStr}!` });
        setTimeout(() => setNotification(null), 6000);
        fetchData();
      } else {
        setNotification({ type: 'error', message: data.message || 'Error al sincronizar' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error de conexión con el servidor' });
    } finally {
      setSyncing(false);
    }
  };

  const totalMatchesCount = useMemo(() => {
    return Object.values(allData).reduce((sum, matches) => {
      const future = (matches || []).filter(m => {
        let mDate = m.date;
        if (m.time?.includes(' ')) mDate = m.time.split(' ')[0];
        return !isPastMatch(mDate);
      });
      return sum + future.length;
    }, 0);
  }, [allData]);

  const renderResultBadge = (res: string) => {
    if (!res) return null;
    const clean = res.toUpperCase().trim();
    if (clean === "G") return <span className="bg-neon-green/20 text-neon-green border border-neon-green/30 text-[10px] font-black px-1.5 py-0.5 rounded">G</span>;
    if (clean === "E") return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-black px-1.5 py-0.5 rounded">E</span>;
    if (clean === "P") return <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-1.5 py-0.5 rounded">P</span>;
    return <span className="bg-white/10 text-white/60 border border-white/20 text-[10px] font-black px-1.5 py-0.5 rounded">{clean}</span>;
  };

  return (
    <div className="space-y-8 w-full flex flex-col items-center md:items-stretch pb-24" style={{ zoom: 0.75 } as any}>
      {/* Notification */}
      {notification && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500",
          notification.type === 'success' ? "bg-neon-green text-deep-black" : "bg-red-500 text-white"
        )}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-8">
        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-[10px] font-black uppercase tracking-widest">
              Calendario Flashscore
            </span>
            <span className="text-xs font-bold text-white/40">
              {totalMatchesCount} eventos totales
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4 text-center md:text-left">
            Próximos <span className="text-neon-green italic">Partidos</span>
          </h1>
          <p className="text-white/40 text-[10px] sm:text-xs font-medium max-w-lg text-center md:text-left">
            Despliega cada competición para ver los encuentros programados y cuotas automáticas.
          </p>
        </div>

        {/* Sync Button & Status */}
        <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={runSync}
            disabled={syncing}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white hover:text-neon-green hover:border-neon-green/50 transition-all hover:bg-white/[0.06] shadow-lg disabled:cursor-not-allowed disabled:opacity-50 group w-full md:w-auto justify-center"
            title="Sincronizar Partidos Próximos"
          >
            <RefreshCw className={cn("h-5 w-5 text-neon-green", syncing && "animate-spin")} />
            <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-neon-green transition-colors">
              {syncing ? "Sincronizando..." : "Sincronizar Partidos"}
            </span>
          </button>

          {/* Last Sync Indicator */}
          {lastSyncTime && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green animate-in fade-in slide-in-from-top-2 duration-300 shadow-[0_0_20px_rgba(0,255,135,0.15)]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Sincronizado: {lastSyncTime}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Matches Content - Accordion Layout */}
      <div className="w-full space-y-6 max-w-[calc(100vw-32px)] sm:max-w-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
            <div className="relative">
              <RefreshCw className="h-10 w-10 text-neon-green animate-spin" />
              <div className="absolute inset-0 blur-xl bg-neon-green/20 animate-pulse" />
            </div>
            <span className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Procesando datos...</span>
          </div>
        ) : sortedLeagues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
            <Calendar className="h-16 w-16 text-white/5 mb-6" />
            <p className="text-sm font-black uppercase tracking-widest text-white/20 italic">No hay ligas registradas</p>
          </div>
        ) : (
          sortedLeagues.map((league) => {
            const rawMatches = allData[league] || [];
            const leagueMatches = rawMatches.filter(m => {
              let mDate = m.date;
              if (m.time?.includes(' ')) mDate = m.time.split(' ')[0];
              return !isPastMatch(mDate);
            });

            const isExpanded = !!expandedLeagues[league];
            const logo = MASTER_LEAGUES[league];

            return (
              <div 
                key={league} 
                className="border border-white/10 rounded-xl overflow-hidden bg-[#070D14]/60 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300"
              >
                {/* League Header / Accordion Bar */}
                <div 
                  onClick={() => toggleLeague(league)}
                  className="flex items-center justify-between bg-[#0B1727] hover:bg-[#112238] border-b border-white/10 px-4 sm:px-6 py-3.5 cursor-pointer transition-all duration-200 select-none group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Star 
                      className={cn(
                        "h-4 w-4 transition-colors shrink-0 cursor-pointer",
                        starredLeagues[league] 
                          ? "text-yellow-400 fill-yellow-400 hover:text-yellow-300" 
                          : "text-white/40 hover:text-yellow-400"
                      )} 
                      onClick={(e) => toggleStarLeague(league, e)} 
                    />
                    <div className="h-6 w-6 sm:h-7 sm:w-7 bg-white rounded-md p-1 flex items-center justify-center shrink-0 shadow-md">
                      <img src={logo || "https://p-cdn.api-sports.io/football/leagues/generic.png"} alt="" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate group-hover:text-neon-green transition-colors">
                      {league}
                    </span>
                    <span className="text-[10px] font-bold text-neon-green/80 bg-neon-green/10 px-2 py-0.5 rounded-full border border-neon-green/20 ml-1 shrink-0">
                      {leagueMatches.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <ChevronDown className={cn("h-4 w-4 text-white/40 group-hover:text-white transition-transform duration-300", isExpanded && "rotate-180 text-neon-green")} />
                  </div>
                </div>

                {/* Expanded Matches List */}
                {isExpanded && (
                  <div className="divide-y divide-white/5 bg-[#070D14]">
                    {leagueMatches.length === 0 ? (
                      <div className="px-6 py-8 text-center text-xs font-bold text-white/30 italic">
                        No hay partidos programados para esta competición.
                      </div>
                    ) : (
                      leagueMatches.map((match, idx) => {
                        const homeLogo = getTeamLogo(match.home);
                        const awayLogo = getTeamLogo(match.away);
                        
                        let matchDate = match.date;
                        let matchTime = match.time;
                        if (match.time.includes(' ')) {
                          const parts = match.time.split(' ');
                          matchDate = parts[0];
                          matchTime = parts[1];
                        }

                        return (
                          <Link key={match.id + idx} href={`/matches/${match.id}`} className="transition-colors group/row block">
                            {/* Main Match Row */}
                            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer select-none">
                              <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                                <Star className="h-4 w-4 text-white/20 hover:text-yellow-400 cursor-pointer shrink-0 transition-colors" onClick={(e) => e.stopPropagation()} />
                                
                                {/* Date & Time */}
                                <div className="flex items-center gap-2 shrink-0 border-r border-white/5 pr-4 sm:pr-6 mr-2 sm:mr-4">
                                  <span className="text-xs sm:text-sm font-black text-neon-green uppercase tracking-wider">
                                    {matchDate}
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-white/80 tabular-nums">
                                    {matchTime}
                                  </span>
                                </div>

                                {/* Teams Stack */}
                                <div className="flex flex-col gap-2 min-w-0 flex-1 py-1">
                                  {/* Home */}
                                  <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 sm:h-5 sm:w-5 rounded p-0.5 bg-white flex items-center justify-center shrink-0 shadow">
                                      {homeLogo ? (
                                        <img src={homeLogo} alt="" className="h-full w-full object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />
                                      ) : (
                                        <span className="text-[8px] font-black text-deep-black">{match.home?.[0]}</span>
                                      )}
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-white group-hover/row:text-neon-green transition-colors truncate">
                                      {normalizeTeamName(match.home)}
                                    </span>
                                  </div>

                                  {/* Away */}
                                  <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 sm:h-5 sm:w-5 rounded p-0.5 bg-white flex items-center justify-center shrink-0 shadow">
                                      {awayLogo ? (
                                        <img src={awayLogo} alt="" className="h-full w-full object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />
                                      ) : (
                                        <span className="text-[8px] font-black text-deep-black">{match.away?.[0]}</span>
                                      )}
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-white/80 group-hover/row:text-neon-green transition-colors truncate">
                                      {normalizeTeamName(match.away)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Side Action Indicator */}
                              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-4">
                                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover/row:bg-white/10 transition-colors">
                                  <ExternalLink className="h-4 w-4 text-white/40 group-hover/row:text-neon-green transition-colors" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


