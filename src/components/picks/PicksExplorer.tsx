"use client";

import { useState, useMemo, useEffect } from "react";
import { MatchGroup } from "@/components/ui/MatchGroup";
import { cn, simpleNormalize } from "@/lib/utils";
import { CategoryFilter } from "./CategoryFilter";
import { BetSlip } from "./BetSlip";
import { BankrollManager } from "./BankrollManager";
import { AnalysisDrawer } from "./AnalysisDrawer";
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
  home_slug?: string;
  away_slug?: string;
  is_top?: boolean;
  created_at: string;
}

interface PicksExplorerProps {
  initialPicks: Pick[];
}

export function PicksExplorer({ initialPicks }: PicksExplorerProps) {
  const [filter, setFilter] = useState<string>("pending");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPickIds, setSelectedPickIds] = useState<string[]>([]);
  const [analysisPick, setAnalysisPick] = useState<any | null>(null);
  
  const normalizeOdds = (odds: any): number => {
    if (typeof odds === 'number') return odds;
    const n = parseFloat(String(odds).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const getMarketId = (p: Pick): string => {
    const m = simpleNormalize((p.market || "") + " " + (p.pick || ""));
    if (m.includes("mitad") || m.includes("1st") || m.includes("1a") || m.includes("1ra") || m.includes("primera parte")) return "mitad";
    if (m.includes("ambos") || m.includes("marcan") || m.includes("btts")) return "ambos_marcan";
    if (m.includes("doble") || m.includes("oportunidad") || m.includes("double chance")) return "doble";
    if (m.includes("ganador") || m.includes("resultado") || m.includes("1x2") || m.includes("final")) return "ganador";
    if (m.includes("handicap") || m.includes("asiatico")) return "handicap";
    if (m.includes("goles") || m.includes("total") || m.includes("over") || m.includes("under")) return "goles";
    return "other_" + simpleNormalize(p.market || "otros");
  };

  const marketCategories = useMemo(() => {
    const basePicks = filter === "all" ? initialPicks : initialPicks.filter(p => p.status === filter);
    
    // 1. Contar picks por cada categoría posible
    const counts: Record<string, number> = { all: basePicks.length, top: 0 };
    const labels: Record<string, string> = { 
      all: "Todos", 
      top: "Top Picks", 
      mitad: "1ª Mitad", 
      ambos_marcan: "Ambos Marcan", 
      doble: "Doble Oportunidad", 
      ganador: "Ganador", 
      handicap: "Hándicap", 
      goles: "Goles" 
    };
    const icons: Record<string, string> = { 
      all: "💎", top: "🔥", mitad: "🌐", ambos_marcan: "⚽", doble: "🛡️", ganador: "🏆", handicap: "📊", goles: "🥅" 
    };

    basePicks.forEach(p => {
      // Check Top Picks
      const isTop = p.is_top || ((normalizeOdds(p.odds) >= 1.50) && ((p.confianza || 0) >= 85 || (p.stake || 0) >= 8.5));
      if (isTop) counts.top = (counts.top || 0) + 1;

      // Check Category
      const mid = getMarketId(p);
      counts[mid] = (counts[mid] || 0) + 1;
      
      // If it's a dynamic category not in our labels, use the market name
      if (!labels[mid] && mid.startsWith("other_")) {
        labels[mid] = p.market || "Otros";
        icons[mid] = "📈";
      }
    });

    // 2. Construir lista final filtrando las que tienen 0 (excepto 'all')
    const result = Object.keys(counts)
      .filter(id => id === "all" || counts[id] > 0)
      .map(id => ({
        id,
        label: labels[id] || id,
        icon: icons[id] || "📈",
        count: counts[id]
      }));

    // Ordenar: primero all y top, luego el resto por cuenta
    return result.sort((a, b) => {
      if (a.id === "all") return -1;
      if (b.id === "all") return 1;
      if (a.id === "top") return -1;
      if (b.id === "top") return 1;
      return b.count - a.count;
    });
  }, [initialPicks, filter]);

  // Reset selected market if it no longer exists in current view
  useEffect(() => {
    if (selectedMarket !== "all" && !marketCategories.find(c => c.id === selectedMarket)) {
      setSelectedMarket("all");
    }
  }, [marketCategories, selectedMarket]);

  const filteredBySearchAndMarket = useMemo(() => {
    let result = initialPicks;

    if (selectedMarket === "top") {
      result = result.filter(p => p.is_top || ((normalizeOdds(p.odds) >= 1.50) && ((p.confianza || 0) >= 85 || (p.stake || 0) >= 8.5)));
    } else if (selectedMarket !== "all") {
      result = result.filter(p => getMarketId(p) === selectedMarket);
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

  const openAnalysis = (data: any) => {
    setAnalysisPick(data);
  };

  return (
    <div className="space-y-8">

      {/* Row 1: Status Filters & Search Toggle */}
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="min-w-0">
          <CategoryFilter 
            categories={statsCategories}
            selectedId={filter}
            onSelect={setFilter}
            showStats={false}
          />
        </div>
        
        <div className="flex items-center h-[32px] bg-white/[0.03] border border-white/[0.05] rounded-full px-1 gap-1 shadow-xl hover:border-white/10 transition-all duration-300 -mt-[3px]">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={cn(
              "h-[24px] px-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2",
              isSearchOpen 
                ? "bg-accent text-black shadow-[0_0_15px_rgba(200,255,0,0.2)]" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            {isSearchOpen && <span className="text-[9px] font-black uppercase tracking-widest pr-1">Cerrar</span>}
          </button>
          
          <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
          
          <div className="h-[24px] flex items-center px-1">
            <BankrollManager />
          </div>
        </div>
      </div>

      {/* Row 2: Market Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full">
          <CategoryFilter 
            categories={marketCategories}
            selectedId={selectedMarket}
            onSelect={setSelectedMarket}
          />
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-accent transition-colors" />
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué evento buscas?..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/40 transition-all"
            />
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-12">
        {groupedData.length > 0 ? (
          groupedData.map(([date, matches]) => (
            <div key={date} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-zinc-800" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                  {date}
                </span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              
              <div className="space-y-3">
                {Object.entries(matches).map(([matchKey, matchPicks]) => (
                  <MatchGroup 
                    key={matchKey} 
                    picks={matchPicks} 
                    selectedPickIds={selectedPickIds}
                    onTogglePick={togglePick}
                    onOpenAnalysis={openAnalysis}
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

      <AnalysisDrawer 
        picks={analysisPick ? (Array.isArray(analysisPick) ? analysisPick : [analysisPick]) : null}
        isOpen={!!analysisPick}
        onClose={() => setAnalysisPick(null)}
      />
    </div>
  );
}
