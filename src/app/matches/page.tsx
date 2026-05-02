"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn, normalizeTeamName } from "@/lib/utils";
import { Clock, Calendar, Loader2, ChevronRight } from "lucide-react";
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

function parseDate(time: string): string {
  // time example: "02.05. 21:00" or "03.05. 14:00"
  const parts = time.split(" ");
  return parts[0] || ""; // "02.05."
}

function formatDateLabel(raw: string): string {
  if (!raw) return "Sin fecha";
  // raw = "02.05." → we build a nice label
  const [day, month] = raw.replace(".", "").split(".");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthName = months[parseInt(month, 10) - 1] || month;
  const d = new Date();
  const today = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
  const tomorrow = new Date(d); tomorrow.setDate(d.getDate() + 1);
  const tomorrowStr = `${String(tomorrow.getDate()).padStart(2, "0")}.${String(tomorrow.getMonth() + 1).padStart(2, "0")}.`;

  if (raw === today) return "Hoy";
  if (raw === tomorrowStr) return "Mañana";
  return `${day} ${monthName}`;
}

export default function MatchesPage() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [allData, setAllData] = useState<Record<string, Match[]>>({});
  const [loading, setLoading] = useState(true);

  // Load once
  useEffect(() => {
    fetch("/upcoming_matches_detailed.json")
      .then((r) => r.json())
      .then(setAllData)
      .catch(() => setAllData({}))
      .finally(() => setLoading(false));
  }, []);

  const matches = useMemo(() => allData[activeLeague] || [], [allData, activeLeague]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Match[]> = {};
    for (const m of matches) {
      const key = parseDate(m.time);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [matches]);

  const dateKeys = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-deep-black pt-28 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex flex-col items-center text-center mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-1.5 w-12 bg-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Calendario</span>
            <div className="h-1.5 w-12 bg-accent" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-text-primary uppercase tracking-tighter leading-[0.85]">
            Próximos{" "}
            <span className="text-accent text-glow">Partidos</span>
          </h1>
        </header>

        {/* League Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-10">
          {LEAGUES.map((league) => {
            const logo = MASTER_LEAGUES[league];
            const isActive = activeLeague === league;
            return (
              <button
                key={league}
                onClick={() => setActiveLeague(league)}
                className={cn(
                  "group flex items-center gap-2.5 px-4 py-3 rounded-lg border transition-all duration-300 shrink-0",
                  isActive
                    ? "border-accent/40 bg-bg-surface shadow-[0_6px_20px_-6px_rgba(200,255,0,0.15)]"
                    : "border-border-base bg-bg-surface/40 hover:border-accent/20 hover:bg-bg-surface/80"
                )}
              >
                {logo && (
                  <div className="h-5 w-5 shrink-0 bg-white rounded-sm flex items-center justify-center p-0.5">
                    <img src={logo} alt="" className="h-full w-full object-contain" />
                  </div>
                )}
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-colors",
                  isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                )}>
                  {league}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Cargando...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-border-base rounded-xl bg-bg-surface/30">
              <Calendar className="h-12 w-12 text-text-muted/10 mb-3" />
              <p className="text-sm font-black uppercase text-text-muted italic">Sin partidos programados</p>
            </div>
          ) : (
            <div className="space-y-8">
              {dateKeys.map((dateKey) => (
                <section key={dateKey}>
                  {/* Date separator */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-accent" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">
                        {formatDateLabel(dateKey)}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] text-text-muted font-mono">{grouped[dateKey].length} partidos</span>
                  </div>

                  {/* Match cards */}
                  <div className="space-y-2">
                    {grouped[dateKey].map((match, idx) => {
                      const homeLogo = getTeamLogo(match.home);
                      const awayLogo = getTeamLogo(match.away);
                      const kickoff = match.time.split(" ").pop() || "";

                      return (
                        <div
                          key={match.id + idx}
                          className="group relative flex items-center gap-4 bg-bg-surface border border-border-base hover:border-accent/25 rounded-xl px-5 py-4 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                        >
                          {/* Time */}
                          <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-white/5 pr-4">
                            <Clock size={10} className="text-accent mb-1" />
                            <span className="text-[12px] font-black tabular-nums text-text-primary">{kickoff}</span>
                          </div>

                          {/* Teams */}
                          <div className="flex-1 grid grid-cols-[1fr_32px_1fr] items-center gap-3">
                            {/* Home */}
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-[11px] md:text-sm font-black uppercase tracking-tight text-text-primary text-right leading-tight line-clamp-1">
                                {normalizeTeamName(match.home)}
                              </span>
                              <div className="h-9 w-9 bg-white rounded-md p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                                {homeLogo
                                  ? <img src={homeLogo} alt="" className="h-full w-full object-contain" />
                                  : <div className="h-full w-full bg-zinc-200 rounded-sm" />
                                }
                              </div>
                            </div>

                            {/* VS */}
                            <div className="flex items-center justify-center">
                              <span className="text-[9px] font-black text-text-muted/40 italic">VS</span>
                            </div>

                            {/* Away */}
                            <div className="flex items-center justify-start gap-3">
                              <div className="h-9 w-9 bg-white rounded-md p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                                {awayLogo
                                  ? <img src={awayLogo} alt="" className="h-full w-full object-contain" />
                                  : <div className="h-full w-full bg-zinc-200 rounded-sm" />
                                }
                              </div>
                              <span className="text-[11px] md:text-sm font-black uppercase tracking-tight text-text-primary leading-tight line-clamp-1">
                                {normalizeTeamName(match.away)}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight
                            size={16}
                            className="shrink-0 text-white/10 group-hover:text-accent transition-colors hidden md:block"
                          />

                          {/* Hover line */}
                          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
