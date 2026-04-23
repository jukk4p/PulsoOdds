"use client";

import { useState, useMemo } from "react";
import { MatchGroup } from "@/components/ui/MatchGroup";
import { cn, translateLeagueName, simpleNormalize } from "@/lib/utils";
import { BetSlip } from "./BetSlip";

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
  analysis?: string;
  alertas?: string;
  factores?: string;
  ev?: number;
  kickoff?: string;
  confianza?: number;
  home_logo?: string;
  away_logo?: string;
  competition_logo?: string;
  razonamiento?: string;
}

interface PicksExplorerProps {
  initialPicks: Pick[];
}

export function PicksExplorer({ initialPicks }: PicksExplorerProps) {
  const [filter, setFilter] = useState<string>("pending");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPickIds, setSelectedPickIds] = useState<string[]>([]);
  
  // 🎯 OPCIONES DE MERCADO (PÍLDORAS CON EMOJIS)
  const marketOptions = [
    { id: "all", label: "💎 TODOS" },
    { id: "top", label: "🔥 TOP PICKS" },
    { id: "mitad", label: "⚽ 1ª MITAD" },
    { id: "ambos_marcan", label: "⚽ AMBOS MARCAN" },
    { id: "doble", label: "🛡️ DOBLE OPORTUNIDAD" },
    { id: "ganador", label: "🏆 GANADOR DEL PARTIDO" },
    { id: "handicap", label: "📊 HÁNDICAP ASIÁTICO" },
    { id: "goles", label: "🔢 TOTAL DE GOLES" },
  ];

  const normalizeOdds = (odds: any): number => {
    if (typeof odds === 'number') return odds;
    const n = parseFloat(String(odds).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  // 🔍 PASO 1: Filtrar por Mercado y Búsqueda (Base para las Stats)
  const filteredBySearchAndMarket = useMemo(() => {
    let result = initialPicks;

    // Filtro de Mercado
    if (selectedMarket === "top") {
      result = result.filter(p => (normalizeOdds(p.odds) >= 1.50) && ((p.confianza || 0) >= 85 || (p.stake || 0) >= 8.5));
    } else if (selectedMarket !== "all") {
      const search = selectedMarket.toLowerCase();
      result = result.filter(p => {
        const m = simpleNormalize((p.market || "") + " " + (p.pick || ""));
        if (search === "mitad") return m.includes("mitad") || m.includes("1st") || m.includes("1a") || m.includes("1ra") || m.includes("primera parte");
        if (search === "ambos_equipos" || search === "ambos_marcan") return m.includes("ambos") || m.includes("marcan") || m.includes("btts");
        if (search === "doble") return m.includes("doble") || m.includes("oportunidad") || m.includes("double chance");
        if (search === "ganador" || search === "resultado") return m.includes("ganador") || m.includes("resultado") || m.includes("1x2") || m.includes("final");
        if (search === "handicap") return m.includes("handicap") || m.includes("asiatico");
        if (search === "goles") return m.includes("goles") || m.includes("total") || m.includes("over") || m.includes("under");
        return m.includes(search);
      });
    }

    // Filtro de Búsqueda
    if (searchQuery.trim()) {
      const q = simpleNormalize(searchQuery);
      result = result.filter(p => 
        simpleNormalize(p.match || "").includes(q) || 
        simpleNormalize(p.competition || "").includes(q) || 
        simpleNormalize(p.market || "").includes(q)
      );
    }

    return result;
  }, [initialPicks, selectedMarket, searchQuery]);

  // 📊 PASO 2: Estadísticas DINÁMICAS (basadas en el filtrado anterior)
  const stats = useMemo(() => {
    return [
      { id: "pending", label: "PENDIENTES", count: filteredBySearchAndMarket.filter(p => p.status === 'pending').length, color: "text-neon-green" },
      { id: "won", label: "GANADOS", count: filteredBySearchAndMarket.filter(p => p.status === 'won').length, color: "text-white/40" },
      { id: "lost", label: "PERDIDOS", count: filteredBySearchAndMarket.filter(p => p.status === 'lost').length, color: "text-white/40" },
      { id: "void", label: "NULOS", count: filteredBySearchAndMarket.filter(p => p.status === 'void').length, color: "text-white/40" },
      { id: "all", label: "TODOS", count: filteredBySearchAndMarket.length, color: "text-white/40" },
    ];
  }, [filteredBySearchAndMarket]);

  // 🎯 PASO 3: Filtrado final por Estado y Agrupación Doble (Fecha -> Partido)
  const groupedData = useMemo(() => {
    let result = filteredBySearchAndMarket;
    
    if (filter !== "all") {
      result = result.filter(p => p.status === filter);
    }

    // Doble agrupación: Record<Fecha, Record<Partido, Pick[]>>
    const groups: Record<string, Record<string, Pick[]>> = {};
    
    result.forEach(p => {
      const d = new Date(p.match_date);
      const date = d.toLocaleDateString('es-ES', { 
        weekday: 'long', day: 'numeric', month: 'long' 
      });
      
      // Clave robusta: Normalizamos competencia, partido y solo usamos la fecha (YYYY-MM-DD)
      const dayKey = d.toISOString().split('T')[0];
      const matchKey = `${simpleNormalize(p.competition || "")}_${simpleNormalize(p.match || "")}_${dayKey}`;
      
      if (!groups[date]) groups[date] = {};
      if (!groups[date][matchKey]) groups[date][matchKey] = [];
      groups[date][matchKey].push(p);
    });

    // Ordenar fechas cronológicamente
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(Object.values(a[1])[0][0].match_date).getTime();
      const dateB = new Date(Object.values(b[1])[0][0].match_date).getTime();
      return dateA - dateB;
    });
  }, [filteredBySearchAndMarket, filter]);

  const togglePick = (id: string) => {
    setSelectedPickIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* ━━━ CABECERA: STATS + BUSCADOR ━━━ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Barra de Stats */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
          {stats.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className="flex items-center gap-2 whitespace-nowrap group transition-all"
            >
              <span className={cn(
                "text-[11px] font-black tracking-tighter transition-all",
                filter === s.id ? "text-neon-green" : "text-white/30 group-hover:text-white/60"
              )}>
                {s.label}
              </span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold min-w-[20px] text-center transition-all",
                filter === s.id ? "bg-neon-green text-deep-black" : "bg-white/5 text-white/20"
              )}>
                {s.count}
              </span>
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative group w-full md:w-72">
          <svg 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-green transition-colors" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR EQUIPO, LIGA, MERCADO..."
            className="w-full bg-[#181b25]/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-neon-green/30 focus:bg-[#181b25] transition-all"
          />
        </div>
      </div>

      {/* ━━━ FILTROS DE MERCADO (PÍLDORAS NEÓN) ━━━ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {marketOptions.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMarket(m.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight whitespace-nowrap transition-all border",
              selectedMarket === m.id 
                ? "bg-neon-green text-deep-black border-neon-green shadow-[0_0_20px_rgba(0,230,118,0.2)]" 
                : "bg-[#181b25]/50 text-white/40 border-white/5 hover:border-white/10 hover:text-white/70"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ━━━ LISTADO AGRUPADO (FECHA -> PARTIDO) ━━━ */}
      <div className="space-y-12">
        {groupedData.length > 0 ? (
          groupedData.map(([date, matches]) => (
            <div key={date} className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] whitespace-nowrap italic">
                  ── {date}
                </span>
                <div className="h-[1px] w-full bg-white/[0.03]" />
              </div>
              
              <div className="space-y-4">
                {Object.entries(matches).map(([matchKey, matchPicks]) => (
                  <MatchGroup 
                    key={matchKey} 
                    picks={matchPicks} 
                    selectedPickIds={selectedPickIds}
                    onTogglePick={togglePick}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-20 italic">No hay picks que coincidan con los filtros.</div>
        )}
      </div>

      <BetSlip 
        picks={initialPicks.filter(p => selectedPickIds.includes(p.id))} 
        onRemove={togglePick} 
        onClear={() => setSelectedPickIds([])} 
      />
    </div>
  );
}
