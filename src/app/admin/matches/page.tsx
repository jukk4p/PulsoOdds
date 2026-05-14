"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn, normalizeTeamName } from "@/lib/utils";
import { Clock, Calendar, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, ExternalLink, ChevronDown, Filter } from "lucide-react";
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
};

export default function AdminMatchesPage() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [allData, setAllData] = useState<Record<string, Match[]>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isLeagueMenuOpen, setIsLeagueMenuOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch("/upcoming_matches_detailed.json?t=" + Date.now());
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
        setNotification({ type: 'success', message: 'Partidos actualizados correctamente' });
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

  const matches = useMemo(() => allData[activeLeague] || [], [allData, activeLeague]);

  return (
    <div className="space-y-8 w-full flex flex-col items-center md:items-stretch">
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
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col items-center md:items-start w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4 text-center md:text-left">
            Próximos <span className="text-neon-green italic">Partidos</span>
          </h1>
          <p className="text-white/40 text-[10px] sm:text-xs font-medium max-w-lg text-center md:text-left">
            Control de calendario y próximos encuentros para la generación de picks automáticos.
          </p>
        </div>

      </div>

      {/* Selectors Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-12 bg-white/[0.01] border border-white/5 p-4 sm:p-5 md:p-8 rounded-[24px] sm:rounded-[32px] w-fit max-w-[calc(100vw-32px)]">
        {/* League Selector */}
        <div className="relative flex flex-col items-center md:items-start w-full md:w-auto">
          <div className="flex items-center gap-4 mb-3">
            <Filter className="h-3 w-3 text-neon-green" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Filtrar por Competición</span>
          </div>
          
          <div className="flex items-stretch justify-center md:justify-start gap-3 w-full md:w-auto">
            <div className="relative w-fit">
              <button
                onClick={() => setIsLeagueMenuOpen(!isLeagueMenuOpen)}
                className={cn(
                  "inline-flex items-center gap-4 px-6 py-4 h-[64px] md:h-[72px] rounded-2xl border transition-all duration-300",
                  isLeagueMenuOpen 
                    ? "bg-white/[0.05] border-neon-green/50 shadow-[0_10px_40px_-10px_rgba(0,255,135,0.2)]" 
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-lg">
                    <img src={MASTER_LEAGUES[activeLeague] || "https://p-cdn.api-sports.io/football/leagues/generic.png"} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-black uppercase tracking-widest text-white leading-tight truncate w-full max-w-[120px] sm:max-w-none">{activeLeague}</span>
                    <span className="text-[9px] font-bold text-neon-green/60 whitespace-nowrap">{allData[activeLeague]?.length || 0} eventos programados</span>
                  </div>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300 shrink-0", isLeagueMenuOpen && "rotate-180 text-neon-green")} />
              </button>

              {/* Dropdown Menu */}
              {isLeagueMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLeagueMenuOpen(false)} />
                  <div className="absolute top-full left-0 min-w-full mt-2 z-50 bg-[#0F0F0F] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
                      {LEAGUES.map((league) => {
                        const logo = MASTER_LEAGUES[league];
                        const count = allData[league]?.length || 0;
                        const isActive = activeLeague === league;

                        return (
                          <button
                            key={league}
                            onClick={() => {
                              setActiveLeague(league);
                              setIsLeagueMenuOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group",
                              isActive && "bg-neon-green/[0.05]"
                            )}
                          >
                            <div className="h-8 w-8 bg-white rounded-md p-1 flex items-center justify-center shrink-0">
                              <img src={logo || "https://p-cdn.api-sports.io/football/leagues/generic.png"} alt="" className="h-full w-full object-contain" />
                            </div>
                            <span className={cn(
                              "text-[11px] font-black uppercase tracking-widest transition-colors",
                              isActive ? "text-neon-green" : "text-white/60 group-hover:text-white"
                            )}>
                              {league}
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-[9px] font-bold text-white/20">{count}</span>
                              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_10px_rgba(0,255,135,0.8)]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button 
              onClick={runSync}
              disabled={syncing}
              className="p-3.5 md:p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-neon-green hover:border-neon-green/30 transition-all hover:bg-white/[0.05] h-[64px] md:h-[72px] disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
              title="Sincronizar Partidos Próximos"
            >
              <RefreshCw className={cn("h-5 w-5", syncing && "animate-spin text-neon-green")} />
            </button>
          </div>
        </div>
      </div>


      {/* Matches Content */}
      <div className="min-h-[400px] w-full max-w-[calc(100vw-32px)] sm:max-w-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
            <div className="relative">
              <RefreshCw className="h-10 w-10 text-neon-green animate-spin" />
              <div className="absolute inset-0 blur-xl bg-neon-green/20 animate-pulse" />
            </div>
            <span className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Procesando datos...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
            <Calendar className="h-16 w-16 text-white/5 mb-6" />
            <p className="text-sm font-black uppercase tracking-widest text-white/20 italic">No hay partidos registrados</p>
            <button onClick={runSync} className="mt-8 text-neon-green text-[10px] font-black uppercase tracking-widest hover:underline">Iniciar primer scrapeo</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {matches.map((match, idx) => {
              const homeLogo = getTeamLogo(match.home);
              const awayLogo = getTeamLogo(match.away);

              // Helper: styled initials avatar
              const TeamAvatar = ({ name, logo }: { name: string; logo: string | null }) => {
                const initials = name
                  ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  : '?';
                return logo ? (
                  <img
                    src={logo}
                    alt={name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null;
                // Always render initials as hidden fallback
              };

              const TeamLogo = ({ name, logo, size }: { name: string; logo: string | null; size: 'sm' | 'md' }) => {
                const initials = name
                  ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
                  : '?';
                const sizeClass = size === 'sm' ? 'h-9 w-9 md:h-11 md:w-11' : 'h-11 w-11';
                return (
                  <div className={`${sizeClass} rounded-lg md:rounded-xl shrink-0 shadow-lg group-hover:scale-110 transition-transform overflow-hidden relative`}>
                    {logo ? (
                      <div className="h-full w-full bg-white p-1.5 md:p-2 flex items-center justify-center">
                        <img
                          src={logo}
                          alt={name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            // Show initials fallback on error
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="h-full w-full bg-white/10 flex items-center justify-center text-neon-green font-black text-[11px] tracking-wider">${initials}</div>`;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full bg-white/10 border border-white/10 flex items-center justify-center text-neon-green font-black text-[11px] tracking-wider">
                        {initials}
                      </div>
                    )}
                  </div>
                );
              };
              
              return (
                <div
                  key={match.id + idx}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white/[0.02] border border-white/5 hover:border-neon-green/20 rounded-2xl px-5 md:px-8 py-4 md:py-6 transition-all duration-300 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-row items-center gap-4 md:gap-8 flex-1">
                    {/* Time Info */}
                    <div className="flex flex-col items-center justify-center min-w-[52px] md:min-w-[70px] border-r border-white/5 pr-4 md:pr-8 py-1">
                      <span className="text-[9px] md:text-[10px] font-black text-neon-green mb-0.5 md:mb-1 tabular-nums">{match.date}</span>
                      <span className="text-base md:text-xl font-black text-white tabular-nums tracking-tighter">{match.time}</span>
                    </div>

                    {/* Teams Info */}
                    <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-8">
                      {/* Home */}
                      <div className="flex items-center justify-end gap-2 md:gap-5">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-white text-right leading-tight line-clamp-2 group-hover:text-neon-green transition-colors">
                          {normalizeTeamName(match.home)}
                        </span>
                        <TeamLogo name={normalizeTeamName(match.home)} logo={homeLogo} size="sm" />
                      </div>

                      {/* VS */}
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/5 bg-deep-black flex items-center justify-center shrink-0">
                          <span className="text-[7px] md:text-[8px] font-black text-white/20 italic">VS</span>
                        </div>
                      </div>

                      {/* Away */}
                      <div className="flex items-center justify-start gap-2 md:gap-5">
                        <TeamLogo name={normalizeTeamName(match.away)} logo={awayLogo} size="sm" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-white leading-tight line-clamp-2 group-hover:text-neon-green transition-colors">
                          {normalizeTeamName(match.away)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[8px] font-mono text-white/20 mr-2 hidden md:block">ID: {match.id}</span>
                    <ChevronRight className="text-white/10 group-hover:text-neon-green transition-colors" size={16} />
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
