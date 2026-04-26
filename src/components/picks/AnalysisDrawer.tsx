"use client";

import { useEffect, useState } from "react";
import { cn, normalizeOdds, normalizeBettingPick } from "@/lib/utils";
import { normalizeTeamName, normalizeLeagueName } from "@/lib/team-normalization";
import { 
  X, Zap, TrendingUp, History, Info, 
  BarChart3, ShieldAlert, Target, AlertCircle, 
  CheckCircle2, ShieldCheck
} from "lucide-react";

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
  razonamiento?: string;
  confianza?: number;
  home_stats?: any;
  away_stats?: any;
  alertas?: string;
  factores?: string;
  ev?: number;
  home_slug?: string;
  away_slug?: string;
}

interface AnalysisDrawerProps {
  pick: Pick | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisDrawer({ pick, isOpen, onClose }: AnalysisDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [teamForm, setTeamForm] = useState<{ home: string[]; away: string[] }>({ home: [], away: [] });
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchForm();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, pick]);

  async function fetchForm() {
    if (!pick) return;
    setIsLoadingForm(true);
    try {
      const slugList = [pick.home_slug, pick.away_slug].filter(Boolean);
      
      // NORMALIZAMOS la liga para que coincida con lo que guardamos en Supabase
      const normalizedLeague = normalizeLeagueName(pick.competition);
      
      const url = slugList.length > 0 
        ? `/api/standings?slugs=${encodeURIComponent(slugList.join(','))}`
        : `/api/standings?league=${encodeURIComponent(normalizedLeague)}`;
        
      let res = await fetch(url);
      let data = await res.json();
      
      // FALLBACK: Si no hay datos para esa liga, intentamos buscar en TODAS las ligas
      if (!Array.isArray(data) || data.length === 0) {
        console.log("⚠️ No se encontraron standings por liga, intentando búsqueda global...");
        const fallbackRes = await fetch(`/api/standings`);
        data = await fallbackRes.json();
      }
      
      if (Array.isArray(data)) {
        const homeSlug = pick.home_slug;
        const awaySlug = pick.away_slug;
        
        // Nombres crudos del Pick
        const [homeRaw, awayRaw] = (pick.match || "").split(/\s+vs\s+/i);
        
        // Normalizamos ambos para comparar "manzanas con manzanas"
        const homeNorm = normalizeTeamName(homeRaw).toLowerCase();
        const awayNorm = normalizeTeamName(awayRaw).toLowerCase();

        // 1. Intentar match por Slug (Prioridad)
        let homeData = homeSlug ? data.find(s => s.team_slug === homeSlug) : null;
        let awayData = awaySlug ? data.find(s => s.team_slug === awaySlug) : null;

        // 2. Fallback por Nombre Normalizado (Búsqueda agresiva)
        if (!homeData) {
          homeData = data.find(s => {
            const teamNorm = normalizeTeamName(s.team).toLowerCase();
            const publicNorm = s.public_name ? normalizeTeamName(s.public_name).toLowerCase() : "";
            return teamNorm === homeNorm || publicNorm === homeNorm || teamNorm.includes(homeNorm) || homeNorm.includes(teamNorm);
          });
        }

        if (!awayData) {
          awayData = data.find(s => {
            const teamNorm = normalizeTeamName(s.team).toLowerCase();
            const publicNorm = s.public_name ? normalizeTeamName(s.public_name).toLowerCase() : "";
            return teamNorm === awayNorm || publicNorm === awayNorm || teamNorm.includes(awayNorm) || awayNorm.includes(teamNorm);
          });
        }

        setTeamForm({
          home: homeData?.form?.split('') || [],
          away: awayData?.form?.split('') || []
        });
      }
    } catch (err) {
      console.error("Error fetching form:", err);
    } finally {
      setIsLoadingForm(false);
    }
  }

  if (!mounted || !pick) return null;

  const getHumanVerdict = () => {
    if (!pick) return null;
    
    const verdicts = [];
    const ev = pick.ev || 0;
    const confidence = pick.confianza || 70;
    const stake = pick.stake || 1;

    // Traduciendo el EV
    if (ev > 0.15) verdicts.push({ icon: <Zap className="w-4 h-4 text-accent" />, text: "VALOR EXTREMO: Cuota muy desajustada a nuestro favor." });
    else if (ev > 0.05) verdicts.push({ icon: <TrendingUp className="w-4 h-4 text-accent" />, text: "CUOTA CON VALOR: El premio supera el riesgo detectado." });

    // Traduciendo la Confianza
    if (confidence >= 88) verdicts.push({ icon: <CheckCircle2 className="w-4 h-4 text-accent" />, text: "ALTA PROBABILIDAD: Datos históricos muy favorables." });
    
    // Traduciendo el Stake
    if (stake <= 1.5) verdicts.push({ icon: <ShieldCheck className="w-4 h-4 text-text-muted" />, text: "APUESTA CON PRUDENCIA: Recomendamos ir con calma." });

    // Análisis inteligente del razonamiento (Keyword scanning)
    const text = (pick.razonamiento || "").toLowerCase();
    
    if (text.includes("xg") || text.includes("expected goals") || text.includes("goles esperados")) {
      verdicts.push({ 
        icon: <Zap className="w-4 h-4 text-accent" />, 
        text: "PELIGRO GENERADO: El equipo crea jugadas de gol claras." 
      });
    }

    if (text.includes("momentum") || text.includes("inercia") || text.includes("dominio")) {
      verdicts.push({ 
        icon: <TrendingUp className="w-4 h-4 text-accent" />, 
        text: "PRESIÓN OFENSIVA: El equipo tiene el control del ritmo." 
      });
    }

    if (text.includes("defensivo") || text.includes("muro") || text.includes("solidez")) {
      verdicts.push({ 
        icon: <ShieldCheck className="w-4 h-4 text-accent" />, 
        text: "SOLIDEZ DEFENSIVA: Muy difícil que le marquen goles hoy." 
      });
    }

    if (verdicts.length === 0) verdicts.push({ icon: <Target className="w-4 h-4 text-accent" />, text: "PICK EQUILIBRADO: Oportunidad sólida por tendencia." });

    return verdicts;
  };

  const humanVerdicts = getHumanVerdict();


  const humanizeReasoning = (text: string | undefined) => {
    if (!text) return "Nuestro algoritmo detecta una ineficiencia en las cuotas basadas en el rendimiento histórico de ambos equipos en este mercado específico.";
    
    return text
      .replace(/\b(xg|expected goals|goles esperados)\b/gi, "Peligro Generado")
      .replace(/\b(momentum|inercia|empuje)\b/gi, "Presión Ofensiva")
      .replace(/\b(ev\+|ev|valor esperado positivo|valor esperado)\b/gi, "Ventaja de Cuota")
      .replace(/\b(handicap asiatico)\b/gi, "Margen de Victoria")
      .replace(/\b(profit)\b/gi, "Beneficio");
  };

  const homeRaw = (pick.match || "").split(/\s+vs\s+/i)[0];
  const awayRaw = (pick.match || "").split(/\s+vs\s+/i)[1];

  const homeForm = pick.home_stats?.form || [];
  const awayForm = pick.away_stats?.form || [];

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-[500px] bg-[#0D121A] border-l border-white/10 z-[101] shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">
              Análisis Avanzado
            </span>
            <h2 className="text-lg font-black text-white uppercase italic">
              {pick.match}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
          
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <StatPill 
              icon={<Target className="w-3.5 h-3.5 text-accent" />}
              label="Confianza"
              value={`${pick.confianza || 70}%`}
            />
            <StatPill 
              icon={<TrendingUp className="w-3.5 h-3.5 text-accent" />}
              label="Valor (EV)"
              value={pick.ev ? `+${(pick.ev * 100).toFixed(1)}%` : "N/A"}
            />
            <StatPill 
              icon={<History className="w-3.5 h-3.5 text-accent" />}
              label="Stake"
              value={`${pick.stake}/10`}
            />
          </div>

          {/* Form / Streaks Section */}
          <div className="space-y-4">
            <SectionHeader icon={<TrendingUp size={14} />} title="Estado de Forma" />
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5 space-y-6">
              {/* Home Team Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-tight">{homeRaw}</span>
                  <div className="flex gap-1.5">
                    {isLoadingForm ? (
                      <div className="flex gap-1.5 animate-pulse">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-5 h-5 rounded-full bg-white/5" />)}
                      </div>
                    ) : teamForm.home.length > 0 ? (
                      teamForm.home.map((res: string, i: number) => <ResultDot key={i} result={res} />)
                    ) : (
                      <span className="text-[9px] text-text-muted italic">Sin datos recientes</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Away Team Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-tight">{awayRaw}</span>
                  <div className="flex gap-1.5">
                    {isLoadingForm ? (
                      <div className="flex gap-1.5 animate-pulse">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-5 h-5 rounded-full bg-white/5" />)}
                      </div>
                    ) : teamForm.away.length > 0 ? (
                      teamForm.away.map((res: string, i: number) => <ResultDot key={i} result={res} />)
                    ) : (
                      <span className="text-[9px] text-text-muted italic">Sin datos recientes</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Veredicto Humano - Traductor de IA */}
          {humanVerdicts && (
            <div className="space-y-4">
              <SectionHeader icon={<CheckCircle2 size={14} />} title="Veredicto Pulso" />
              <div className="grid gap-3">
                {humanVerdicts.map((v, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="mt-0.5">{v.icon}</div>
                    <p className="text-[11px] font-bold text-text-secondary leading-relaxed uppercase tracking-wide">
                      {v.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning / Technical Analysis */}
          <div className="space-y-4">
            <SectionHeader icon={<Zap size={14} />} title="Análisis del Experto" />
            <div className="prose prose-invert max-w-none">
              <p className="text-sm text-text-secondary leading-relaxed italic border-l-2 border-accent pl-4 py-1">
                {humanizeReasoning(pick.razonamiento)}
              </p>
            </div>
          </div>

          {/* Key Factors */}
          {pick.factores && (
            <div className="space-y-4">
              <SectionHeader icon={<BarChart3 size={14} />} title="Factores Clave" />
              <div className="grid gap-3">
                {pick.factores.split('\n').filter(f => f.trim()).map((factor, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded bg-white/[0.02] border border-white/5">
                    <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary leading-normal">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts / Risks */}
          {pick.alertas && (
            <div className="space-y-4">
              <SectionHeader icon={<ShieldAlert size={14} />} title="Alertas y Riesgos" />
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs text-red-200/70 leading-relaxed italic">
                  {pick.alertas}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">MERCADO</span>
              <span className="text-xs font-black text-white uppercase">{pick.market}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">CUOTA ACTUAL</span>
              <span className="text-xl font-mono font-black text-accent">{normalizeOdds(pick.odds).toFixed(2)}</span>
            </div>
          </div>
          <button 
            className="w-full py-4 bg-accent text-bg-base font-black uppercase tracking-[0.2em] text-xs rounded-sm hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(200,255,0,0.15)]"
            onClick={onClose}
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </>
  );
}

function StatPill({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 border border-white/5 text-center">
      {icon}
      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2 mb-1">{label}</span>
      <span className="text-xs font-black text-text-primary">{value}</span>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: any, title: string }) {
  return (
    <div className="flex items-center gap-2 text-text-primary">
      <div className="p-1.5 rounded bg-accent/10 text-accent">
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</span>
    </div>
  );
}

function ResultDot({ result }: { result: string }) {
  const res = result.toUpperCase();
  const isWin = res === 'W' || res === 'V' || res === 'G';
  const isLoss = res === 'L' || res === 'D' || res === 'P';
  const isDraw = res === 'D' || res === 'E';

  return (
    <div className={cn(
      "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black",
      isWin && "bg-accent/20 text-accent border border-accent/30",
      isLoss && "bg-red-500/20 text-red-500 border border-red-500/30",
      isDraw && "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
      !isWin && !isLoss && !isDraw && "bg-white/5 text-text-muted border border-white/10"
    )}>
      {res}
    </div>
  );
}
