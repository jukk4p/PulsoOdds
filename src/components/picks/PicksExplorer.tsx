"use client";

import { useState, useMemo } from "react";
import { MatchGroup } from "@/components/ui/MatchGroup";
import { cn, simpleNormalize } from "@/lib/utils";
import { CategoryFilter } from "./CategoryFilter";
import { BetSlip } from "./BetSlip";
import { BankrollManager } from "./BankrollManager";
import { Search } from "lucide-react";

function normalizeMatchKey(match: string): string {
  return simpleNormalize(match)
    .replace(/\b(fc|cf|afc|sc|ac|fk|sk|rc|cd|rcd|sd|ud|cp|ca|as|ss|ssc|ac|bsc|vfb|vfl|tsv|sv|sg|rsc|ksc|kv|ck|fk|nk|ok|hsk|zsk|msk)\b/g, '')
    .replace(/\s*(vs\.?|-|\|)\s*/g, ' vs ')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  
  const normalizeOdds = (odds: any): number => {
    if (typeof odds === 'number') return odds;
    const n = parseFloat(String(odds).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const marketCategories = useMemo(() => {
    // Definimos los criterios de cada mercado para reusar en el conteo
    const getMarketMatches = (marketId: string, picks: Pick[]) => {
      if (marketId === "all") return picks;
      if (marketId === "top") return picks.filter(p => (normalizeOdds(p.odds) >= 1.50) && ((p.confianza || 0) >= 85 || (p.stake || 0) >= 8.5));
      
      const search = marketId.toLowerCase();
      return picks.filter(p => {
        const m = simpleNormalize((p.market || "") + " " + (p.pick || ""));
        if (search === "mitad") return m.includes("mitad") || m.includes("1st") || m.includes("1a") || m.includes("1ra") || m.includes("primera parte");
        if (search === "ambos_marcan") return m.includes("ambos") || m.includes("marcan") || m.includes("btts");
        if (search === "doble") return m.includes("doble") || m.includes("oportunidad") || m.includes("double chance");
        if (search === "ganador") return m.includes("ganador") || m.includes("resultado") || m.includes("1x2") || m.includes("final");
        if (search === "handicap") return m.includes("handicap") || m.includes("asiatico");
        if (search === "goles") return m.includes("goles") || m.includes("total") || m.includes("over") || m.includes("under");
        return m.includes(search);
      });
    };

    // Base de picks filtrada por el estado (pending/won/etc) para que los counts de mercado sean coherentes
    const basePicks = filter === "all" ? initialPicks : initialPicks.filter(p => p.status === filter);

    return [
      { id: "all", label: "💎 Todos", count: basePicks.length },
      { id: "top", label: "🔥 Top Picks", count: getMarketMatches("top", basePicks).length },
      { id: "mitad", label: "⚽ 1ª Mitad", count: getMarketMatches("mitad", basePicks).length },
      { id: "ambos_marcan", label: "⚽ Ambos Marcan", count: getMarketMatches("ambos_marcan", basePicks).length },
      { id: "doble", label: "🛡️ Doble Oportunidad", count: getMarketMatches("doble", basePicks).length },
      { id: "ganador", label: "🏆 Ganador", count: getMarketMatches("ganador", basePicks).length },
      { id: "handicap", label: "📊 Hándicap", count: getMarketMatches("handicap", basePicks).length },
      { id: "goles", label: "🔢 Goles", count: getMarketMatches("goles", basePicks).length },
    ];
  }, [initialPicks, filter]);



  const filteredBySearchAndMarket = useMemo(() => {
    let result = initialPicks;

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

  const statsCategories = useMemo(() => [
    { id: "pending", label: "Pendientes", count: filteredBySearchAndMarket.filter(p => p.status === 'pending').length },
    { id: "won", label: "Ganados", count: filteredBySearchAndMarket.filter(p => p.status === 'won').length },
    { id: "lost", label: "Perdidos", count: filteredBySearchAndMarket.filter(p => p.status === 'lost').length },
    { id: "void", label: "Nulos", count: filteredBySearchAndMarket.filter(p => p.status === 'void').length },
    { id: "all", label: "Todos", count: filteredBySearchAndMarket.length },
  ], [filteredBySearchAndMarket]);

  const groupedData = useMemo(() => {
    let result = filteredBySearchAndMarket;
    if (filter !== "all") result = result.filter(p => p.status === filter);

    const groups: Record<string, Record<string, Pick[]>> = {};
    result.forEach(p => {
      const d = new Date(p.match_date);
      const date = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const matchKey = `${normalizeMatchKey(p.match || "")}_${dayKey}`;
      if (!groups[date]) groups[date] = {};
      if (!groups[date][matchKey]) groups[date][matchKey] = [];
      groups[date][matchKey].push(p);
    });

    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(Object.values(a[1])[0][0].match_date).getTime();
      const dateB = new Date(Object.values(b[1])[0][0].match_date).getTime();
      return filter === 'pending' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredBySearchAndMarket, filter]);

  const togglePick = (id: string) => {
    setSelectedPickIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-10">
      
      <div className="flex flex-col gap-6 mb-10">
        {/* Row 1: Status & Bankroll */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-bg-surface/20 p-4 rounded-lg border border-white/5">
          <div className="flex-1">
            <CategoryFilter 
              categories={statsCategories}
              selectedId={filter}
              onSelect={setFilter}
            />
          </div>
          <BankrollManager />
        </div>

        {/* Row 2: Markets & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-base/30">
          <div className="flex-1">
            <CategoryFilter 
              categories={marketCategories}
              selectedId={selectedMarket}
              onSelect={setSelectedMarket}
            />
          </div>
          <div className="relative group w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/40 group-focus-within:text-accent transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BUSCAR EVENTO..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-16">
        {groupedData.length > 0 ? (
          groupedData.map(([date, matches]) => (
            <div key={date} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-accent" />
                <span className="text-[11px] font-black text-text-primary uppercase tracking-[0.4em] italic">
                  {date}
                </span>
                <div className="h-px flex-1 bg-border-base opacity-30" />
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
          <div className="py-32 text-center">
            <p className="text-text-muted font-bold uppercase tracking-widest text-xs italic">
              No se encontraron resultados para los filtros aplicados.
            </p>
          </div>
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
