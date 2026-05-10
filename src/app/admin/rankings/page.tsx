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
  LayoutGrid, 
  Filter, 
  ChevronDown,
  Loader2
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
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [standingType, setStandingType] = useState('General');
  const [isLeagueMenuOpen, setIsLeagueMenuOpen] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [fetchingTeam, setFetchingTeam] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchStandings();
  }, [activeLeague, standingType]);

  async function runFullSync() {
    setSyncing(true);
    setMessage({ type: 'success', text: 'Iniciando Scraper y Sincronización... Esto puede tardar un par de minutos.' });
    
    try {
      const res = await fetch('/api/admin/sync-all', { method: 'POST' });
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
      .eq('league', activeLeague)
      .eq('type', standingType)
      .order('pos', { ascending: true });

    if (error) {
      console.error('Error fetching standings:', error);
    } else {
      setTeams(data || []);
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
    <div className="space-y-8 animate-in fade-in duration-500 relative w-full flex flex-col items-center md:items-stretch">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white italic tracking-tighter flex items-center gap-2 sm:gap-3">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-neon-green shrink-0" />
            <span className="truncate">GESTIÓN DE CLASIFICACIONES</span>
          </h1>
          <p className="text-white/40 text-[10px] sm:text-xs uppercase font-bold tracking-widest mt-1 text-center md:text-left">
            Edición manual de tablas de posiciones
          </p>
        </div>
        
      </div>

      {/* Selectors Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-12 bg-white/[0.01] border border-white/5 p-4 sm:p-5 md:p-8 rounded-[24px] sm:rounded-[32px] w-fit max-w-[calc(100vw-32px)]">
        {/* League Selector */}
        <div className="relative flex flex-col items-center md:items-start">
          <div className="flex items-center gap-4 mb-3">
            <Filter className="h-3 w-3 text-neon-green" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Filtrar por Competición</span>
          </div>
          
          <div className="relative w-fit">
            <button
              onClick={() => setIsLeagueMenuOpen(!isLeagueMenuOpen)}
              className={cn(
                "inline-flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300",
                isLeagueMenuOpen 
                  ? "bg-white/[0.05] border-neon-green/50 shadow-[0_10px_40px_-10px_rgba(0,255,135,0.2)]" 
                  : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-lg border border-white/5 overflow-hidden">
                  {getLeagueLogo(activeLeague)
                    ? <img src={getLeagueLogo(activeLeague)!} alt="" className="h-full w-full object-contain" />
                    : <span className="text-[9px] font-black text-neon-green">{activeLeague.split('-').pop()?.trim().slice(0,3).toUpperCase()}</span>
                  }
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-black uppercase tracking-widest text-white leading-tight truncate w-full max-w-[120px] sm:max-w-none">{activeLeague}</span>
                  <span className="text-[9px] font-bold text-neon-green/60 whitespace-nowrap">Actualizado recientemente</span>
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
                      const isActive = activeLeague === league;
                      
                      return (
                        <button
                          key={league}
                          onClick={() => {
                            setActiveLeague(league);
                            setIsLeagueMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 px-6 py-4 transition-all hover:bg-white/5 group",
                            isActive && "bg-neon-green/5"
                          )}
                        >
                          <div className="h-8 w-8 bg-white rounded-md p-1 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity overflow-hidden">
                            {getLeagueLogo(league)
                              ? <img src={getLeagueLogo(league)!} alt="" className="h-full w-full object-contain" />
                              : <span className="text-[8px] font-black text-neon-green">{league.split('-').pop()?.trim().slice(0,3).toUpperCase()}</span>
                            }
                          </div>
                          <span className={cn(
                            "text-[11px] font-black uppercase tracking-widest transition-colors",
                            isActive ? "text-neon-green" : "text-white/60 group-hover:text-white"
                          )}>
                            {league}
                          </span>
                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_10px_rgba(0,255,135,0.8)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Type Selector & Sync */}
        <div className="flex flex-col items-center md:items-start gap-3 w-full">
          <div className="flex items-center gap-4">
            <Filter className="h-3 w-3 text-neon-green" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Tipo de Clasificación</span>
          </div>
          <div className="flex items-stretch justify-center md:justify-start gap-2 w-full md:w-auto">
            <div className="flex p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
              {['General', 'Local', 'Visitante'].map((type) => (
                <button
                  key={type}
                  onClick={() => setStandingType(type)}
                  className={cn(
                    "px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest transition-all duration-300",
                    standingType === type 
                      ? "bg-neon-green text-deep-black shadow-lg" 
                      : "text-white/40 hover:text-white/70"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <button 
              onClick={runFullSync}
              disabled={syncing}
              className="px-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-neon-green hover:border-neon-green/30 transition-all hover:bg-white/[0.05] h-full min-h-[46px] md:min-h-[50px] disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0 flex items-center justify-center"
              title="Sincronizar Clasificaciones"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin text-neon-green")} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={cn(
          "flex items-center gap-3 px-6 py-4 rounded-2xl border animate-in slide-in-from-top-4 duration-300",
          message.type === 'success' ? "bg-neon-green/10 border-neon-green/20 text-neon-green" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-bold uppercase tracking-tight">{message.text}</span>
        </div>
      )}

      {/* Standings Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl w-full max-w-[calc(100vw-32px)] sm:max-w-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-2 md:px-6 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center w-10 md:w-16">#</th>
                <th className="px-2 md:px-6 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Equipo</th>
                <th className="px-1 md:px-4 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden sm:table-cell">PJ</th>
                <th className="px-1 md:px-4 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">G</th>
                <th className="px-1 md:px-4 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">E</th>
                <th className="px-1 md:px-4 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">P</th>
                <th className="px-1 md:px-4 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden sm:table-cell">Goles</th>
                <th className="px-1 md:px-4 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden lg:table-cell">DG</th>
                <th className="px-2 md:px-4 py-6 text-[10px] font-black text-neon-green uppercase tracking-[0.2em] text-center bg-neon-green/5">PTS</th>
                <th className="px-4 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center hidden md:table-cell">Forma</th>
                <th className="px-2 md:px-6 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={11} className="px-6 py-10 h-20 bg-white/[0.01]"></td>
                  </tr>
                ))
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-32 text-center text-white/10 font-black uppercase tracking-[0.3em]">
                    No hay datos disponibles para {activeLeague} ({standingType})
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="group hover:bg-neon-green/[0.02] transition-colors">
                    <td className="px-2 md:px-6 py-6 text-center">
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
                    <td className="px-2 md:px-6 py-6">
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
                    <td className="px-2 md:px-4 py-6 text-center hidden sm:table-cell">
                      <span className="text-white font-mono font-bold text-xs md:text-sm">{team.pj}</span>
                    </td>
                    <td className="px-2 md:px-4 py-6 text-center hidden md:table-cell">
                      <span className="text-white/40 font-mono text-xs md:text-sm">{team.pg || team.g || 0}</span>
                    </td>
                    <td className="px-2 md:px-4 py-6 text-center hidden md:table-cell">
                      <span className="text-white/40 font-mono text-xs md:text-sm">{team.pe || team.e || 0}</span>
                    </td>
                    <td className="px-2 md:px-4 py-6 text-center hidden md:table-cell">
                      <span className="text-white/40 font-mono text-xs md:text-sm">{team.pp || team.p || 0}</span>
                    </td>
                    <td className="px-2 md:px-4 py-6 text-center hidden sm:table-cell">
                      <span className="text-white/60 font-mono text-xs md:text-sm">{team.goals}</span>
                    </td>
                    <td className="px-2 md:px-4 py-6 text-center hidden lg:table-cell">
                      <span className="text-white/40 font-mono text-xs">
                        {(() => {
                          const [gf, gc] = (team.goals || "0:0").split(':').map(Number);
                          const diff = gf - gc;
                          return isNaN(diff) ? "0" : (diff > 0 ? `+${diff}` : diff);
                        })()}
                      </span>
                    </td>
                    <td className="px-2 md:px-4 py-6 text-center bg-neon-green/[0.01]">
                      <span className="text-neon-green font-black text-lg md:text-2xl italic tracking-tighter shadow-[0_0_10px_rgba(0,255,135,0.1)]">{team.pts}</span>
                    </td>
                    <td className="px-6 py-6 hidden md:table-cell">
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
                    <td className="px-2 md:px-6 py-6 text-right">
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
