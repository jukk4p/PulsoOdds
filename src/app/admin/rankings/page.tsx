'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  Save, 
  RefreshCw, 
  Pencil, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown,
  Loader2,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoAutocomplete } from '@/components/admin/LogoAutocomplete';
import { MASTER_LEAGUES } from "@/lib/masterDictionaries";
import { getLeagueLogo } from "@/lib/logos";

const LEAGUES = [
  "Spain - LaLiga", "Spain - LaLiga2", "England - Premier League", "Germany - Bundesliga", 
  "Italy - Serie A", "France - Ligue 1", "Netherlands - Eredivisie", "Portugal - Primeira Liga", "England - Championship", 
  "Germany - 2. Bundesliga", "Italy - Serie B", "France - Ligue 2", "Brazil - Serie A", "USA - MLS"
];

export default function AdminRankingsPage() {
  const [allStandings, setAllStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Accordion state
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({
    "Spain - LaLiga": true,
    "England - Premier League": true,
  });

  // Per-league standing type state (General, Local, Visitante)
  const [leagueTypes, setLeagueTypes] = useState<Record<string, string>>({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [fetchingTeam, setFetchingTeam] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchStandings();
  }, []);

  const toggleLeague = (league: string) => {
    setExpandedLeagues(prev => ({ ...prev, [league]: !prev[league] }));
  };

  async function runFullSync() {
    setSyncing(true);
    setMessage({ type: 'success', text: 'Iniciando Scraper y Sincronización... Esto puede tardar un par de minutos.' });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/sync-all', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '¡Sincronización Total completada con éxito!' });
        fetchStandings();
      } else {
        setMessage({ type: 'error', text: `Error: ${data.error || 'Error desconocido'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al lanzar la sincronización.' });
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }

  async function fetchStandings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .order('pos', { ascending: true });

    if (error) {
      console.error('Error fetching standings:', error);
    } else {
      setAllStandings(data || []);
    }
    setLoading(false);
  }

  const openEditModal = async (team: any) => {
    setFetchingTeam(true);
    setIsModalOpen(true);
    
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('id', team.id)
      .single();

    if (!error && data) {
      setEditingTeam(data);
    } else {
      setEditingTeam({ ...team });
    }
    setFetchingTeam(false);
  };

  const handleModalChange = (field: string, value: any) => {
    setEditingTeam((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveFromModal = async () => {
    if (!editingTeam) return;
    setSaving(editingTeam.id);
    
    const { error } = await supabase
      .from('standings')
      .update({
        pos: parseInt(editingTeam.pos),
        team: editingTeam.team,
        public_name: editingTeam.public_name,
        pj: parseInt(editingTeam.pj),
        pg: parseInt(editingTeam.pg || editingTeam.g || 0),
        pe: parseInt(editingTeam.pe || editingTeam.e || 0),
        pp: parseInt(editingTeam.pp || editingTeam.p || 0),
        pts: parseInt(editingTeam.pts),
        goals: editingTeam.goals,
        form: editingTeam.form,
        logo_team: editingTeam.logo_team || editingTeam.logo_url,
        zone: editingTeam.zone,
        type: editingTeam.type
      })
      .eq('id', editingTeam.id);

    if (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: `${editingTeam.public_name || editingTeam.team} actualizado` });
      setIsModalOpen(false);
      fetchStandings();
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative w-full flex flex-col items-center md:items-stretch pb-20 min-w-0 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex flex-col items-center md:items-start w-full min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white italic tracking-tighter flex items-center gap-2 sm:gap-3 w-full min-w-0">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-neon-green shrink-0" />
            <span className="truncate">GESTIÓN DE CLASIFICACIONES</span>
          </h1>
          <p className="text-white/40 text-[10px] sm:text-xs uppercase font-bold tracking-widest mt-1 text-center md:text-left truncate w-full">
            Edición manual y sincronización de tablas de posiciones
          </p>
        </div>
      </div>

      {/* Top Sync Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 bg-white/[0.01] border border-white/5 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] w-full min-w-0 shadow-2xl backdrop-blur-sm">
        <div className="min-w-0 w-full sm:w-auto">
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider truncate">Sincronización Automática</h2>
          <p className="text-white/40 text-[10px] sm:text-xs uppercase font-bold tracking-widest mt-1 truncate">
            Extraer y actualizar datos en tiempo real desde Flashscore
          </p>
        </div>

        <button 
          onClick={runFullSync}
          disabled={syncing}
          className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-2xl bg-neon-green text-deep-black font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,135,0.2)] hover:shadow-[0_0_50px_rgba(0,255,135,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3 shrink-0"
          title="Sincronizar Clasificaciones"
        >
          <RefreshCw className={cn("h-4 w-4 shrink-0", syncing && "animate-spin")} />
          <span className="truncate">{syncing ? "SINCRONIZANDO..." : "SINCRONIZAR CLASIFICACIONES"}</span>
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={cn(
          "flex items-center gap-3 px-6 py-4 rounded-2xl border animate-in slide-in-from-top-4 duration-300 w-full min-w-0",
          message.type === 'success' ? "bg-neon-green/10 border-neon-green/20 text-neon-green" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-bold uppercase tracking-tight truncate">{message.text}</span>
        </div>
      )}

      {/* Standings Content - Accordion Layout */}
      <div className="w-full space-y-6 min-w-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02] w-full min-w-0">
            <Loader2 className="h-10 w-10 text-neon-green animate-spin mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 truncate">Cargando clasificaciones...</span>
          </div>
        ) : LEAGUES.map((league) => {
          const currentType = leagueTypes[league] || 'General';
          const leagueStandings = allStandings.filter(t => t.league === league && t.type === currentType);
          const isExpanded = !!expandedLeagues[league];
          const logo = getLeagueLogo(league);

          return (
            <div 
              key={league} 
              className="border border-white/10 rounded-xl overflow-hidden bg-[#070D14]/60 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 w-full min-w-0"
            >
              {/* League Header / Accordion Bar */}
              <div 
                onClick={() => toggleLeague(league)}
                className="flex items-center justify-between bg-[#0B1727] hover:bg-[#112238] border-b border-white/10 px-4 sm:px-6 py-3.5 cursor-pointer transition-all duration-200 select-none group w-full min-w-0"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <Star className="h-4 w-4 text-white/40 hover:text-yellow-400 transition-colors shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); }} />
                  <div className="h-6 w-6 sm:h-7 sm:w-7 bg-white rounded-md p-1 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[8px] font-black text-neon-green">{league.split('-').pop()?.trim().slice(0,3).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate group-hover:text-neon-green transition-colors">
                    {league}
                  </span>
                  <span className="text-[10px] font-bold text-neon-green/80 bg-neon-green/10 px-2 py-0.5 rounded-full border border-neon-green/20 ml-1 shrink-0 hidden sm:inline-block">
                    {leagueStandings.length} {league === "Europe - Euro" || league === "World - World Cup" ? "selecciones" : "equipos"}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2 sm:ml-4">
                  <span className="text-[9px] font-bold text-neon-green/80 bg-neon-green/10 px-1.5 py-0.5 rounded-full border border-neon-green/20 sm:hidden">
                    {leagueStandings.length}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 group-hover:text-white transition-transform duration-300 shrink-0", isExpanded && "rotate-180 text-neon-green")} />
                </div>
              </div>

              {/* Expanded Standings Table */}
              {isExpanded && (
                <div className="bg-[#070D14] divide-y divide-white/5 w-full min-w-0">
                  {/* Selector de Modalidad estilo Flashscore por debajo del nombre de la liga */}
                  <div className="bg-[#070D14] px-4 sm:px-6 py-1.5 border-b border-white/10 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none select-none w-full min-w-0">
                    {(['General', 'Local', 'Visitante'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setLeagueTypes(prev => ({ ...prev, [league]: type })); 
                        }}
                        className={cn(
                          "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap",
                          currentType === type 
                            ? "bg-neon-green text-deep-black shadow-[0_0_10px_rgba(0,255,135,0.2)] font-black" 
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {leagueStandings.length === 0 ? (
                    <div className="px-6 py-12 text-center text-xs font-bold text-white/30 italic w-full min-w-0">
                      No hay datos de clasificación disponibles para esta competición ({currentType}).
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar w-full min-w-0">
                      <table className="w-full text-left border-collapse border-spacing-0">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.01]">
                            <th className="px-2 md:px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center w-10 md:w-16">#</th>
                            <th className="px-2 md:px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Equipo</th>
                            <th className="px-1 md:px-4 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden sm:table-cell">PJ</th>
                            <th className="px-1 md:px-4 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">G</th>
                            <th className="px-1 md:px-4 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">E</th>
                            <th className="px-1 md:px-4 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">P</th>
                            <th className="px-1 md:px-4 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden sm:table-cell">Goles</th>
                            <th className="px-1 md:px-4 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden lg:table-cell">DG</th>
                            <th className="px-2 md:px-4 py-4 text-[10px] font-black text-neon-green uppercase tracking-[0.2em] text-center bg-neon-green/5">PTS</th>
                            <th className="px-4 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">Forma</th>
                            <th className="px-2 md:px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {leagueStandings.map((team) => (
                            <tr key={team.id} className="group hover:bg-neon-green/[0.02] transition-colors">
                              <td className="px-2 md:px-6 py-4 text-center">
                                <div className={cn(
                                  "inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg text-[10px] md:text-xs font-black border",
                                  team.zone === "champions" ? "bg-neon-green text-deep-black border-neon-green shadow-[0_0_15px_rgba(200,255,0,0.3)]" : 
                                  team.zone === "europa" ? "bg-white/5 text-neon-green border-neon-green/20" :
                                  team.zone === "relegation" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                  "bg-white/5 text-white/40 border-white/10"
                                )}>
                                  {team.pos}
                                </div>
                              </td>
                              <td className="px-2 md:px-6 py-4">
                                <div className="flex items-center gap-2 md:gap-4">
                                  <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-lg p-1 shadow-sm flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform overflow-hidden">
                                    {team.logo_team || team.logo_url ? (
                                      <img 
                                        src={team.logo_team || team.logo_url} 
                                        alt={team.team} 
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                          const initials = (team.public_name || team.team || '?')
                                            .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            parent.style.background = 'rgba(255,255,255,0.05)';
                                            parent.innerHTML = `<span style="font-size:10px;font-weight:900;color:#C8FF00;letter-spacing:0.1em">${initials}</span>`;
                                          }
                                        }}
                                      />
                                    ) : (
                                      <span className="text-[10px] font-black text-neon-green">
                                        {(team.public_name || team.team || '?').split(' ').slice(0,2).map((w: string) => w[0]).join('').toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-white font-black text-xs md:text-sm uppercase tracking-tight truncate">{team.public_name || team.team}</span>
                                    <span className="text-white/20 text-[8px] md:text-[9px] font-bold uppercase tracking-widest truncate hidden sm:block">{team.team}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 md:px-4 py-4 text-center hidden sm:table-cell">
                                <span className="text-white font-mono font-bold text-xs md:text-sm">{team.pj}</span>
                              </td>
                              <td className="px-2 md:px-4 py-4 text-center hidden md:table-cell">
                                <span className="text-white/40 font-mono text-xs md:text-sm">{team.pg || team.g || 0}</span>
                              </td>
                              <td className="px-2 md:px-4 py-4 text-center hidden md:table-cell">
                                <span className="text-white/40 font-mono text-xs md:text-sm">{team.pe || team.e || 0}</span>
                              </td>
                              <td className="px-2 md:px-4 py-4 text-center hidden md:table-cell">
                                <span className="text-white/40 font-mono text-xs md:text-sm">{team.pp || team.p || 0}</span>
                              </td>
                              <td className="px-2 md:px-4 py-4 text-center hidden sm:table-cell">
                                <span className="text-white/60 font-mono text-xs md:text-sm">{team.goals}</span>
                              </td>
                              <td className="px-2 md:px-4 py-4 text-center hidden lg:table-cell">
                                <span className="text-white/40 font-mono text-xs">
                                  {(() => {
                                    const [gf, gc] = (team.goals || "0:0").split(':').map(Number);
                                    const diff = gf - gc;
                                    return isNaN(diff) ? "0" : (diff > 0 ? `+${diff}` : diff);
                                  })()}
                                </span>
                              </td>
                              <td className="px-2 md:px-4 py-4 text-center bg-neon-green/[0.01]">
                                <span className="text-neon-green font-black text-lg md:text-2xl italic tracking-tighter shadow-[0_0_10px_rgba(0,255,135,0.1)]">{team.pts}</span>
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                <div className="flex items-center justify-center gap-1.5">
                                  {(team.form || "").split("").slice(-5).map((char: string, i: number) => (
                                    <div 
                                      key={i} 
                                      className={cn(
                                        "w-6 h-6 md:w-7 md:h-7 rounded-md flex items-center justify-center text-[9px] md:text-[10px] font-black shadow-lg",
                                        char === "W" || char === "G" ? "bg-neon-green text-deep-black" :
                                        char === "D" || char === "E" ? "bg-white/10 text-white/60 border border-white/5" :
                                        char === "L" || char === "P" ? "bg-red-500 text-white" :
                                        "bg-white/5 text-white/20"
                                      )}
                                    >
                                      {char === 'W' ? 'G' : char === 'D' ? 'E' : char === 'L' ? 'P' : char}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-2 md:px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 md:gap-2">
                                  <button 
                                    onClick={() => openEditModal(team)}
                                    title="Editar equipo"
                                    className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                  >
                                    <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL EDIT FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-deep-black/95 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 md:px-12 pt-10 pb-6 flex items-center justify-between border-b border-white/5">
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter">EDITAR EQUIPO</h2>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Ajuste manual de estadísticas</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>

            {fetchingTeam ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-neon-green animate-spin" />
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Sincronizando con Supabase...</p>
              </div>
            ) : editingTeam ? (
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] border-l-2 border-neon-green pl-3">Identidad</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nombre Técnico</label>
                      <input 
                        type="text"
                        value={editingTeam.team}
                        onChange={(e) => handleModalChange('team', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nombre Público</label>
                      <input 
                        type="text"
                        value={editingTeam.public_name || ''}
                        onChange={(e) => handleModalChange('public_name', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all"
                        placeholder="Nombre visual en la web"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] border-l-2 border-neon-green pl-3">Estadísticas Principales</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Posición</label>
                      <input 
                        type="number"
                        value={editingTeam.pos}
                        onChange={(e) => handleModalChange('pos', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white font-black focus:outline-none focus:border-neon-green/50 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-2 text-neon-green">
                      <label className="text-[10px] font-black text-neon-green/40 uppercase tracking-widest">Puntos</label>
                      <input 
                        type="number"
                        value={editingTeam.pts}
                        onChange={(e) => handleModalChange('pts', e.target.value)}
                        className="w-full bg-neon-green/[0.03] border border-neon-green/20 rounded-2xl px-5 py-4 text-sm text-neon-green font-black focus:outline-none focus:border-neon-green/50 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">PJ (Jugados)</label>
                      <input 
                        type="number"
                        value={editingTeam.pj}
                        onChange={(e) => handleModalChange('pj', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/60 font-bold focus:outline-none focus:border-neon-green/50 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Goles (A:B)</label>
                      <input 
                        type="text"
                        value={editingTeam.goals}
                        onChange={(e) => handleModalChange('goals', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/60 font-bold focus:outline-none focus:border-neon-green/50 transition-all text-center"
                        placeholder="00:00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] border-l-2 border-neon-green pl-3">Desglose de Partidos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-green-500/40 uppercase tracking-widest text-center block">Victorias (PG)</label>
                      <input 
                        type="number"
                        value={editingTeam.pg || editingTeam.g || 0}
                        onChange={(e) => handleModalChange('pg', e.target.value)}
                        className="w-full bg-green-500/[0.03] border border-green-500/20 rounded-2xl px-5 py-4 text-sm text-green-400 font-bold focus:outline-none focus:border-green-500/50 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-yellow-500/40 uppercase tracking-widest text-center block">Empates (PE)</label>
                      <input 
                        type="number"
                        value={editingTeam.pe || editingTeam.e || 0}
                        onChange={(e) => handleModalChange('pe', e.target.value)}
                        className="w-full bg-yellow-500/[0.03] border border-yellow-500/20 rounded-2xl px-5 py-4 text-sm text-yellow-400 font-bold focus:outline-none focus:border-yellow-500/50 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-red-500/40 uppercase tracking-widest text-center block">Derrotas (PP)</label>
                      <input 
                        type="number"
                        value={editingTeam.pp || editingTeam.p || 0}
                        onChange={(e) => handleModalChange('pp', e.target.value)}
                        className="w-full bg-red-500/[0.03] border border-red-500/20 rounded-2xl px-5 py-4 text-sm text-red-400 font-bold focus:outline-none focus:border-red-500/50 transition-all text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] border-l-2 border-neon-green pl-3">Contexto y Visual</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Forma Reciente</label>
                      <input 
                        type="text"
                        value={editingTeam.form}
                        onChange={(e) => handleModalChange('form', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/40 focus:outline-none focus:border-neon-green/50 transition-all"
                        placeholder="W,D,L,W,W"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Zona de Clasificación</label>
                      <select 
                        value={editingTeam.zone || ''}
                        onChange={(e) => handleModalChange('zone', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all appearance-none"
                      >
                        <option value="" className="bg-deep-black">Sin zona</option>
                        <option value="champions" className="bg-deep-black text-neon-green">Champions League</option>
                        <option value="europa" className="bg-deep-black text-blue-400">Europa League</option>
                        <option value="conference" className="bg-deep-black text-yellow-400">Conference League</option>
                        <option value="relegation" className="bg-deep-black text-red-500">Descenso</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tipo de Tabla</label>
                      <select 
                        value={editingTeam.type || 'General'}
                        onChange={(e) => handleModalChange('type', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all appearance-none"
                      >
                        <option value="General" className="bg-deep-black">General</option>
                        <option value="Local" className="bg-deep-black">Local</option>
                        <option value="Visitante" className="bg-deep-black">Visitante</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <LogoAutocomplete 
                      label="Logotipo del Equipo"
                      value={editingTeam.logo_team || editingTeam.logo_url || ''}
                      onChange={(val) => handleModalChange('logo_team', val)}
                      placeholder="Buscar equipo en el diccionario..."
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={saveFromModal}
                    disabled={saving === editingTeam.id}
                    className="w-full bg-neon-green text-deep-black font-black text-xs uppercase tracking-widest py-6 rounded-2xl shadow-[0_0_40px_rgba(0,255,135,0.2)] hover:shadow-[0_0_60px_rgba(0,255,135,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {saving === editingTeam.id ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    GUARDAR CAMBIOS EN BASE DE DATOS
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
