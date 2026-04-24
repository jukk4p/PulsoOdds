'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Save, RefreshCw, Pencil, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEAGUES = [
  "Spain - LaLiga", "Spain - LaLiga2", "England - Premier League", "Germany - Bundesliga", 
  "Italy - Serie A", "France - Ligue 1", "Netherlands - Eredivisie", "England - Championship", 
  "Germany - 2. Bundesliga", "Italy - Serie B", "France - Ligue 2", "Brazil - Serie A", "USA - MLS"
];

export default function AdminRankingsPage() {
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [fetchingTeam, setFetchingTeam] = useState(false);

  useEffect(() => {
    fetchStandings();
  }, [selectedLeague]);

  async function fetchStandings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('league', selectedLeague)
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
    
    // FETCH FRESCO DE SUPABASE PARA ASEGURAR TODO
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('id', team.id)
      .single();

    if (!error && data) {
      setEditingTeam(data);
    } else {
      setEditingTeam({ ...team }); // Fallback
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
        g: parseInt(editingTeam.g),
        e: parseInt(editingTeam.e),
        p: parseInt(editingTeam.p),
        pts: parseInt(editingTeam.pts),
        goals: editingTeam.goals,
        form: editingTeam.form,
        logo_url: editingTeam.logo_url,
        zone: editingTeam.zone
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

  const saveTeam = async (team: any) => {
    setSaving(team.id);
    const { error } = await supabase
      .from('standings')
      .update({
        pos: parseInt(team.pos),
        team: team.team,
        public_name: team.public_name,
        pj: parseInt(team.pj),
        g: parseInt(team.g),
        e: parseInt(team.e),
        p: parseInt(team.p),
        pts: parseInt(team.pts),
        goals: team.goals,
        form: team.form,
        logo_url: team.logo_url
      })
      .eq('id', team.id);

    if (error) {
      setMessage({ type: 'error', text: `Error al guardar ${team.team}: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: `${team.team} actualizado correctamente` });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Trophy className="h-8 w-8 text-neon-green" />
            GESTIÓN DE RANKINGS
          </h1>
          <p className="text-white/40 text-xs uppercase font-bold tracking-widest mt-1">
            Edición manual de tablas de posiciones
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-neon-green/50 transition-all cursor-pointer"
          >
            {LEAGUES.map(league => (
              <option key={league} value={league} className="bg-deep-black">{league}</option>
            ))}
          </select>
          
          <button 
            onClick={fetchStandings}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-neon-green hover:border-neon-green/30 transition-all"
          >
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </button>
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
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest">Pos</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest">Equipo / Public</th>
                <th className="px-4 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">PJ</th>
                <th className="px-4 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest text-center text-neon-green">PTS</th>
                <th className="px-4 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">Goles</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest">Forma</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8 h-10 bg-white/[0.01]"></td>
                  </tr>
                ))
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-white/20 font-bold uppercase tracking-widest">
                    No hay datos para esta liga
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-black text-sm">{team.pos}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-bold text-sm truncate max-w-[150px]">{team.team}</span>
                        <span className="text-white/40 font-medium text-[10px] truncate max-w-[150px]">{team.public_name || 'Sin nombre público'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-white/60 font-bold text-sm">{team.pj}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-neon-green font-black text-sm shadow-[0_0_10px_rgba(0,255,135,0.1)]">{team.pts}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-white/60 font-bold text-sm">{team.goals}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/40 font-medium text-[10px] uppercase tracking-widest">{team.form}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(team)}
                          title="Editar equipo"
                          className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => saveTeam(team)}
                          disabled={saving === team.id}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            saving === team.id 
                              ? "bg-neon-green/20 text-neon-green cursor-not-allowed" 
                              : "bg-white/5 text-white/40 hover:bg-neon-green hover:text-deep-black hover:shadow-[0_0_15px_rgba(0,255,135,0.4)]"
                          )}
                        >
                          {saving === team.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
            {/* Modal Header */}
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
                {/* Section: Identity */}
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

                {/* Section: Main Stats */}
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

                {/* Section: Breakdown */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] border-l-2 border-neon-green pl-3">Desglose de Partidos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-green-500/40 uppercase tracking-widest text-center block">Victorias (PG)</label>
                      <input 
                        type="number"
                        value={editingTeam.g || 0}
                        onChange={(e) => handleModalChange('g', e.target.value)}
                        className="w-full bg-green-500/[0.03] border border-green-500/20 rounded-2xl px-5 py-4 text-sm text-green-400 font-bold focus:outline-none focus:border-green-500/50 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-yellow-500/40 uppercase tracking-widest text-center block">Empates (PE)</label>
                      <input 
                        type="number"
                        value={editingTeam.e || 0}
                        onChange={(e) => handleModalChange('e', e.target.value)}
                        className="w-full bg-yellow-500/[0.03] border border-yellow-500/20 rounded-2xl px-5 py-4 text-sm text-yellow-400 font-bold focus:outline-none focus:border-yellow-500/50 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-red-500/40 uppercase tracking-widest text-center block">Derrotas (PP)</label>
                      <input 
                        type="number"
                        value={editingTeam.p || 0}
                        onChange={(e) => handleModalChange('p', e.target.value)}
                        className="w-full bg-red-500/[0.03] border border-red-500/20 rounded-2xl px-5 py-4 text-sm text-red-400 font-bold focus:outline-none focus:border-red-500/50 transition-all text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Context & Logo */}
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
                      <input 
                        type="text"
                        value={editingTeam.zone || ''}
                        onChange={(e) => handleModalChange('zone', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/40 focus:outline-none focus:border-neon-green/50 transition-all"
                        placeholder="Champions, Descenso..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">URL del Logotipo</label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-[1.25rem] bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {editingTeam.logo_url ? (
                          <img src={editingTeam.logo_url} className="h-10 w-10 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40?text=?'} />
                        ) : (
                          <Trophy className="h-6 w-6 text-white/5" />
                        )}
                      </div>
                      <input 
                        type="text"
                        value={editingTeam.logo_url || ''}
                        onChange={(e) => handleModalChange('logo_url', e.target.value)}
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[11px] text-white/20 focus:outline-none focus:border-neon-green/50 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Area */}
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
      
      {/* Secondary Fields (Logo URLs) */}
      {!loading && teams.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Gestión de Logos (URLs)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div key={`logo-${team.id}`} className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-white/60 truncate max-w-[150px]">{team.public_name || team.team}</span>
                  <button onClick={() => saveTeam(team)} className="text-neon-green hover:underline">Guardar</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt="Logo" className="h-6 w-6 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/24'} />
                    ) : (
                      <Trophy className="h-4 w-4 text-white/10" />
                    )}
                  </div>
                  <input 
                    type="text"
                    value={team.logo_url || ''}
                    onChange={(e) => handleInputChange(team.id, 'logo_url', e.target.value)}
                    className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white/40 focus:outline-none focus:border-neon-green/30 transition-all"
                    placeholder="URL del logo"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
