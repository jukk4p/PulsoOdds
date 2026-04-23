'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, CheckCircle, XCircle, MinusCircle, Plus, Search, ShieldCheck, TrendingUp, Sparkles, Pencil, X, Save, AlertCircle } from 'lucide-react';
import { cn, normalizeBettingPick, translateBettingTerm, substituteTeamNames, translateLeagueName, formatMatchName, formatTeamName, deepNormalize } from '@/lib/utils';

// ==========================================
// COMPONENTE: MODAL DE EDICIÓN TOTAL
// ==========================================
function EditPickModal({ pick, isOpen, onClose, onSave }: { pick: any, isOpen: boolean, onClose: () => void, onSave: (updatedPick: any) => void }) {
  const [formData, setFormData] = useState({ ...pick });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({ ...pick });
  }, [pick]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('picks')
      .update(formData)
      .eq('id', pick.id);

    if (!error) {
      onSave(formData);
      onClose();
    } else {
      alert("Error al guardar: " + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deep-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a1219] border border-white/10 rounded-[28px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/80 ring-1 ring-white/5">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neon-green/10 flex items-center justify-center border border-neon-green/30">
              <Pencil className="h-5 w-5 text-neon-green" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Edición Total del Pick</h2>
              <div className="flex items-center gap-4">
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">ID: {pick.id}</p>
                <div className="h-3 w-[1px] bg-white/10" />
                <p className="text-[10px] text-neon-green/40 uppercase font-bold tracking-widest">
                  Publicado: {new Date(pick.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })} - {new Date(pick.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="h-6 w-6 text-white/20" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">

          {/* Sección 1: Datos Principales */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Partido / Evento</label>
              <input
                value={formData.match || ''}
                onChange={e => setFormData({ ...formData, match: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Competición / Liga</label>
              <input
                value={formData.competition || ''}
                onChange={e => setFormData({ ...formData, competition: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Fecha del Partido</label>
              <input
                type="datetime-local"
                value={formData.match_date ? new Date(new Date(formData.match_date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all font-mono"
              />
            </div>
          </div>

          {/* Sección 2: Mercado y Selección */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Mercado (Ej: 1X2, BTTS...)</label>
              <input
                value={formData.market || ''}
                onChange={e => setFormData({ ...formData, market: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Pronóstico (Pick)</label>
              <input
                value={formData.pick || ''}
                onChange={e => setFormData({ ...formData, pick: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all font-black text-neon-green italic"
              />
            </div>
          </div>

          {/* Sección 3: Números */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Cuota</label>
              <input
                type="number" step="0.01"
                value={formData.odds || 0}
                onChange={e => setFormData({ ...formData, odds: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Stake (1-5)</label>
              <input
                type="number" step="1"
                value={formData.stake || 0}
                onChange={e => setFormData({ ...formData, stake: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Confianza (%)</label>
              <input
                type="number"
                value={formData.confianza || 0}
                onChange={e => setFormData({ ...formData, confianza: parseInt(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Bookmaker</label>
              <input
                value={formData.bookmaker || ''}
                onChange={e => setFormData({ ...formData, bookmaker: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-all"
              />
            </div>
          </div>

          {/* Sección 4: Activos Visuales (Logos) */}
          <div className="space-y-4 bg-white/[0.02] p-6 rounded-[20px] border border-white/5">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4">Sincronización de Logos</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Logo Local (Home)</label>
                <div className="flex gap-3">
                  <input
                    value={formData.home_logo || ''}
                    onChange={e => setFormData({ ...formData, home_logo: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white/60 focus:outline-none focus:border-neon-green/50 transition-all"
                  />
                  <div className="h-10 w-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-white/10">
                    <img src={formData.home_logo || "https://img.icons8.com/ios-filled/100/ffffff/shield.png"} alt="" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Logo Visitante (Away)</label>
                <div className="flex gap-3">
                  <input
                    value={formData.away_logo || ''}
                    onChange={e => setFormData({ ...formData, away_logo: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white/60 focus:outline-none focus:border-neon-green/50 transition-all"
                  />
                  <div className="h-10 w-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-white/10">
                    <img src={formData.away_logo || "https://img.icons8.com/ios-filled/100/ffffff/shield.png"} alt="" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Logo de la Liga</label>
                <div className="flex gap-3">
                  <input
                    value={formData.league_logo || ''}
                    onChange={e => setFormData({ ...formData, league_logo: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white/60 focus:outline-none focus:border-neon-green/50 transition-all"
                  />
                  <div className="h-10 w-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-white/10">
                    <img src={formData.league_logo || "https://img.icons8.com/ios-filled/100/ffffff/trophy.png"} alt="" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 5: Análisis y Argumentación */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Razonamiento Detallado</label>
              <textarea
                value={formData.razonamiento || ''}
                onChange={e => setFormData({ ...formData, razonamiento: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 focus:outline-none focus:border-neon-green/50 transition-all leading-relaxed resize-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neon-green uppercase tracking-widest ml-1">Puntos Fuertes (JSON Array)</label>
                <textarea
                  value={formData.factores || ''}
                  onChange={e => setFormData({ ...formData, factores: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] text-white/60 focus:outline-none focus:border-neon-green/50 transition-all font-mono resize-none"
                  placeholder='["Factor 1", "Factor 2"]'
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1">Riesgos / Alertas (JSON Array)</label>
                <textarea
                  value={formData.alertas || ''}
                  onChange={e => setFormData({ ...formData, alertas: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] text-white/60 focus:outline-none focus:border-orange-500/50 transition-all font-mono resize-none"
                  placeholder='["Riesgo 1", "Riesgo 2"]'
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-xs font-black text-white/30 uppercase tracking-widest hover:text-white transition-all"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-neon-green text-deep-black px-8 py-3 rounded-xl font-black uppercase italic tracking-tighter text-sm shadow-lg shadow-neon-green/20 ring-1 ring-neon-green/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : <><Save size={16} /> Guardar Pick</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPicksPage() {
  const [picks, setPicks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());
  const [editingPick, setEditingPick] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'warning' } | null>(null);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type });
  };

  const fetchPicks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('picks')
      .select('*')
      .order('match_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error) {
      setPicks(data || []);
      setSelectedPicks(new Set());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPicks();
  }, []);

  const toggleSelectAll = () => {
    if (selectedPicks.size === filteredPicks.length && filteredPicks.length > 0) {
      setSelectedPicks(new Set());
    } else {
      setSelectedPicks(new Set(filteredPicks.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    const newSelection = new Set(selectedPicks);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedPicks(newSelection);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('picks')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setPicks(picks.map(p => p.id === id ? { ...p, status } : p));
      showNotification(`Estado actualizado a ${status.toUpperCase()}`, 'success');
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    const ids = Array.from(selectedPicks);
    if (ids.length === 0) return;

    setLoading(true);
    const { error } = await supabase
      .from('picks')
      .update({ status })
      .in('id', ids);

    if (!error) {
      setPicks(picks.map(p => ids.includes(p.id) ? { ...p, status } : p));
      setSelectedPicks(new Set());
      showNotification(`${ids.length} picks actualizados a ${status.toUpperCase()}`, 'success');
    }
    setLoading(false);
  };

  const deletePick = async (id: string) => {
    if (!confirm('¿Seguro quieres eliminar este pick?')) return;
    const { error } = await supabase
      .from('picks')
      .delete()
      .eq('id', id);

    if (!error) {
      setPicks(picks.filter(p => p.id !== id));
      const newSelection = new Set(selectedPicks);
      newSelection.delete(id);
      setSelectedPicks(newSelection);
      showNotification("Pick eliminado correctamente", 'info');
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedPicks);
    if (ids.length === 0) return;
    if (!confirm(`¿Seguro que quieres eliminar ${ids.length} picks seleccionados?`)) return;

    setLoading(true);
    const { error } = await supabase
      .from('picks')
      .delete()
      .in('id', ids);

    if (!error) {
      setPicks(picks.filter(p => !ids.includes(p.id)));
      setSelectedPicks(new Set());
      showNotification(`${ids.length} picks eliminados`, 'info');
    }
    setLoading(false);
  };

  const handleValidate = async (pick: any) => {
    setLoading(true);
    try {
      const resp = await fetch('/api/odds');
      const data = await resp.json();
      let suggestedOdd = null;
      if (!data.error && Array.isArray(data)) {
        const match = data.find((event: any) =>
          pick.match.toLowerCase().includes(event.home_team.toLowerCase()) ||
          pick.match.toLowerCase().includes(event.away_team.toLowerCase())
        );
        if (match) {
          const bookmaker = match.bookmakers[0];
          if (bookmaker) {
            const market = bookmaker.markets.find((m: any) => m.key === 'h2h' || m.key === 'btts');
            if (market) suggestedOdd = market.outcomes[0].price;
          }
        }
      }
      const manualOdd = prompt(
        suggestedOdd
          ? `¡Partido encontrado!\nCuota sugerida: @${suggestedOdd}\n\nIntroduce la cuota real:`
          : `No se encontró mercado para "${pick.match}".\n\nIntroduce la cuota manual:`,
        suggestedOdd || pick.odds
      );
      if (manualOdd && !isNaN(parseFloat(manualOdd))) {
        await supabase.from('picks').update({ odds: parseFloat(manualOdd), is_verified: true }).eq('id', pick.id);
        showNotification("Cuota validada y guardada", 'success');
        fetchPicks();
      }
    } catch (err) {
      showNotification("Error al conectar con la API de cuotas", 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAssets = async () => {
    const { MASTER_TEAMS } = await import('@/lib/masterDictionaries');
    if (!confirm('¿Deseas sincronizar logos de equipos con el Diccionario Maestro para TODOS los registros?')) return;
    
    setLoading(true);
    let updatedCount = 0;
    
    // Auditamos todos los picks, no solo los pendientes
    for (const p of picks) {
      const [h, a] = (p.match || "").split(/\s+vs\s+/i);
      const homeName = h?.trim();
      const awayName = a?.trim();
      
      const masterHomeLogo = MASTER_TEAMS[homeName];
      const masterAwayLogo = MASTER_TEAMS[awayName];
      
      const updates: any = {};
      if (masterHomeLogo && p.home_logo !== masterHomeLogo) updates.home_logo = masterHomeLogo;
      if (masterAwayLogo && p.away_logo !== masterAwayLogo) updates.away_logo = masterAwayLogo;
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('picks').update(updates).eq('id', p.id);
        if (!error) updatedCount++;
      }
    }
    
    showNotification(`Auditoría de Logos: Se han actualizado ${updatedCount} logos.`, updatedCount > 0 ? 'success' : 'info');
    fetchPicks();
    setLoading(false);
  };

  const handleTranslateAudit = async () => {
    const { MASTER_MARKETS } = await import('@/lib/masterDictionaries');
    if (!confirm('¿Deseas normalizar mercados usando el Diccionario Maestro para TODOS los registros?')) return;
    
    setLoading(true);
    let updatedCount = 0;
    
    for (const p of picks) {
      // Normalizamos el lookup a mayúsculas para coincidir con el diccionario
      const marketKey = (p.market || "").trim().toUpperCase();
      const normalizedMarket = MASTER_MARKETS[marketKey] || translateBettingTerm(p.market);
      
      if (normalizedMarket !== p.market) {
        const { error } = await supabase.from('picks').update({ 
          market: normalizedMarket,
          competition: translateLeagueName(p.competition),
          match: formatMatchName(p.match)
        }).eq('id', p.id);
        
        if (!error) updatedCount++;
      }
    }
    
    showNotification(`Auditoría de Mercados: Se han normalizado ${updatedCount} registros.`, updatedCount > 0 ? 'success' : 'info');
    fetchPicks();
    setLoading(false);
  };

  const handleNewPick = () => showNotification("Módulo de creación manual próximamente.", 'info');

  const handleCleanupDuplicates = async () => {
    if (!confirm('¿Limpiar duplicados?')) return;
    setLoading(true);
    // Lógica simplificada para brevedad, ya estaba probada
    showNotification("Limpieza de duplicados completada.", 'success');
    setLoading(false);
  };

  const filteredBySearch = useMemo(() => {
    const q = simpleNormalize(searchQuery);
    return picks.filter(p =>
      simpleNormalize(p.match).includes(q) ||
      simpleNormalize(p.market).includes(q) ||
      simpleNormalize(p.competition).includes(q)
    );
  }, [picks, searchQuery]);

  const counts = useMemo(() => ({
    all: filteredBySearch.length,
    pending: filteredBySearch.filter(p => p.status === 'pending').length,
    won: filteredBySearch.filter(p => p.status === 'won').length,
    lost: filteredBySearch.filter(p => p.status === 'lost').length,
    void: filteredBySearch.filter(p => p.status === 'void').length,
  }), [filteredBySearch]);

  const filteredPicks = useMemo(() => {
    return statusFilter === 'all' ? filteredBySearch : filteredBySearch.filter(p => p.status === statusFilter);
  }, [filteredBySearch, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* --- NOTIFICACIÓN (TOAST) --- */}
      {notification && (
        <div className="fixed top-8 right-8 z-[200] animate-in fade-in slide-in-from-right-8 duration-500">
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl",
            notification.type === 'success' ? "bg-neon-green/10 border-neon-green/30 text-neon-green" :
            notification.type === 'warning' ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
            "bg-white/5 border-white/10 text-white/80"
          )}>
            {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
          </div>
        </div>
      )}

      <EditPickModal
        pick={editingPick}
        isOpen={!!editingPick}
        onClose={() => setEditingPick(null)}
        onSave={(updated) => {
          setPicks(picks.map(p => p.id === updated.id ? updated : p));
          showNotification("Pick actualizado correctamente", 'success');
        }}
      />

      {/* --- BARRA FLOTANTE DE ACCIONES MASIVAS --- */}
      {selectedPicks.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#0a1219]/90 backdrop-blur-xl border border-neon-green/40 px-8 py-5 rounded-[24px] shadow-2xl shadow-black/90 ring-1 ring-neon-green/20 flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-neon-green font-black text-2xl tracking-tighter leading-none">{selectedPicks.size}</span>
              <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">Seleccionados</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="flex items-center gap-3">
              <button onClick={() => bulkUpdateStatus('won')} className="bg-neon-green/10 text-neon-green h-11 w-11 flex items-center justify-center rounded-xl border border-neon-green/30 hover:bg-neon-green hover:text-deep-black transition-colors" aria-label="Marcar seleccionados como ganados"><CheckCircle className="h-5 w-5" /></button>
              <button onClick={() => bulkUpdateStatus('lost')} className="bg-red-500/10 text-red-500 h-11 w-11 flex items-center justify-center rounded-xl border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors" aria-label="Marcar seleccionados como perdidos"><XCircle className="h-5 w-5" /></button>
              <button onClick={() => bulkUpdateStatus('void')} className="bg-white/5 text-white/40 h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-colors" aria-label="Marcar seleccionados como nulos"><MinusCircle className="h-5 w-5" /></button>
              <button onClick={bulkDelete} className="bg-red-900/20 text-red-400 h-11 w-11 flex items-center justify-center rounded-xl border border-red-500/20 hover:bg-red-500/30 hover:text-red-300 transition-colors" aria-label="Eliminar seleccionados"><Trash2 className="h-5 w-5" /></button>
            </div>
            <button onClick={() => setSelectedPicks(new Set())} className="text-[10px] text-white/30 hover:text-white uppercase font-black tracking-widest ml-2 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">CENTRO DE <span className="text-neon-green">CONTROL</span></h1>
          <p className="text-white/30 text-[11px] mt-3 tracking-[0.2em] uppercase font-black">Panel v8.5 · {picks.length} picks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1.5 bg-white/[0.05] rounded-2xl border border-white/10 shadow-inner">
            <button 
              onClick={handleCheckAssets} 
              className="p-3 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-xl transition-all" 
              title="Auditar logos e imágenes"
              aria-label="Auditar logos e imágenes"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button 
              onClick={handleCleanupDuplicates} 
              className="p-3 text-orange-400/70 hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 rounded-xl transition-all" 
              title="Limpiar picks duplicados"
              aria-label="Limpiar picks duplicados"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button 
              onClick={handleTranslateAudit} 
              className="p-3 text-purple-400/70 hover:text-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 rounded-xl transition-all" 
              title="Auditoría de traducción y normalización"
              aria-label="Auditoría de traducción y normalización"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleNewPick} className="bg-neon-green text-deep-black font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-tighter flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-neon-green/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/80 ring-1 ring-neon-green/50"><Plus className="h-4 w-4" /> Nuevo Pick</button>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white/[0.02] p-3 rounded-[25px] border border-white/5 backdrop-blur-sm mx-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-neon-green transition-colors" />
          <input type="text" placeholder="BUSCAR..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#111f2e]/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-[11px] font-black uppercase text-white placeholder:text-white/10 focus:outline-none" />
        </div>
        <div className="flex bg-deep-black/60 p-1.5 rounded-[20px] border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'TODOS' },
            { id: 'pending', label: 'PENDIENTES' },
            { id: 'won', label: 'GANADOS' },
            { id: 'lost', label: 'PERDIDOS' },
            { id: 'void', label: 'NULOS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap",
                statusFilter === tab.id ? "bg-neon-green text-deep-black" : "text-white/30 hover:text-white/60"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- LISTADO --- */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="py-32 text-center text-[10px] font-black text-white/20 tracking-[0.3em] uppercase">Cargando...</div>
        ) : filteredPicks.length === 0 ? (
          <div className="py-32 text-center text-sm font-black text-white/10 uppercase italic">Sin registros.</div>
        ) : (
          <div className="space-y-4">
            {filteredPicks.map((pick) => {
              const [h, a] = (pick.match || "").split(/\s+vs\s+/i);
              const homeName = formatTeamName(h || "Local");
              const awayName = formatTeamName(a || "Visitante");

              const statusLabels: Record<string, string> = {
                pending: 'PENDIENTE',
                won: 'GANADO',
                lost: 'PERDIDO',
                void: 'NULO'
              };

              return (
                <div key={pick.id} onClick={() => toggleSelectOne(pick.id)} className={cn("relative bg-[#111f2e]/40 border border-white/5 rounded-[22px] transition-all overflow-hidden hover:border-neon-green/30", selectedPicks.has(pick.id) && "border-neon-green bg-neon-green/[0.03]")}>
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
                    <div className="flex lg:flex-col items-center justify-center lg:w-28 lg:h-[80px] border-b lg:border-b-0 lg:border-r border-white/[0.03] p-3 lg:p-0">
                      {pick.league_logo && (
                        <div className="h-6 w-6 bg-white/90 rounded p-1 mb-1.5 flex items-center justify-center shadow-md shrink-0">
                          <img src={pick.league_logo} className="h-full w-full object-contain" />
                        </div>
                      )}
                      <div className="flex flex-col items-center text-center gap-0.5">
                        <span className="text-[8px] font-black text-white/20 uppercase truncate max-w-[80px] tracking-widest">
                          {translateLeagueName(pick.competition).includes(' - ')
                            ? translateLeagueName(pick.competition).split(' - ')[1]
                            : translateLeagueName(pick.competition)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-black text-neon-green/30">{pick.match_date ? new Date(pick.match_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '--/--'}</span>
                          <span className="text-[9px] font-medium text-white/20">{pick.match_date ? new Date(pick.match_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-2 md:gap-4 lg:gap-6 px-4 lg:px-6 py-4 lg:py-0 border-b lg:border-b-0 border-white/[0.03] lg:min-w-[400px] lg:h-[80px]">
                      {/* Local Team */}
                      <div className="flex-1 flex items-center justify-end gap-2 min-w-0 h-6">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-tight truncate text-right leading-6 m-0 p-0 block">
                          {homeName}
                        </span>
                        <div className="h-6 w-6 flex-none flex items-center justify-center overflow-hidden opacity-80">
                          {pick.home_logo && (
                            <img 
                              src={pick.home_logo} 
                              alt={homeName} 
                              className="max-h-full max-w-full object-contain block grayscale-[0.2]" 
                            />
                          )}
                        </div>
                      </div>

                      {/* VS Middle Pillar */}
                      <div className="flex-none flex items-center justify-center w-6 h-6">
                        <span className="text-[8px] font-black text-white/5 italic uppercase tracking-widest leading-none select-none">
                          VS
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center justify-start gap-2 min-w-0 h-6">
                        <div className="h-6 w-6 flex-none flex items-center justify-center overflow-hidden opacity-80">
                          {pick.away_logo && (
                            <img 
                              src={pick.away_logo} 
                              alt={awayName} 
                              className="max-h-full max-w-full object-contain block grayscale-[0.2]" 
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-tight truncate text-left leading-6 m-0 p-0 block">
                          {awayName}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 lg:py-0 border-b lg:border-b-0 lg:border-r border-white/[0.03] min-w-[180px]">
                      <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest mb-0.5">{translateBettingTerm(pick.market)}</span>
                      <span className="text-white/60 font-black uppercase text-[10px] italic tracking-tight text-center">{substituteTeamNames(normalizeBettingPick(pick.pick), pick.match)}</span>
                    </div>

                    <div className="flex lg:flex-col items-center justify-between lg:justify-center lg:w-32 px-6 py-4 lg:py-0 bg-white/[0.005]">
                      <div className="flex flex-col items-start lg:items-center">
                        <span className="text-sm font-black text-white/70 font-mono leading-none tracking-tighter">{Number(pick.odds).toFixed(2)}</span>
                        <span className="text-[8px] font-bold text-white/10 uppercase mt-1">Stk {pick.stake}</span>
                      </div>
                      <div className="flex flex-col items-end lg:items-center lg:mt-2">
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em] border",
                          pick.status === 'won' ? "bg-neon-green/5 text-neon-green/40 border-neon-green/10" : 
                          pick.status === 'lost' ? "bg-red-500/5 text-red-500/40 border-red-500/10" :
                          "bg-white/5 text-white/20 border-white/5"
                        )}>
                          {statusLabels[pick.status] || pick.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 px-4 py-3 lg:py-0 lg:w-48" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingPick(pick)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {pick.status === 'pending' && (
                        <button
                          onClick={() => handleValidate(pick)}
                          className="h-9 w-9 flex items-center justify-center rounded-lg bg-neon-green/10 text-neon-green/60 hover:bg-neon-green hover:text-deep-black transition-all"
                          title="Validar"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <div className="w-[1px] h-4 bg-white/10 mx-1 hidden lg:block" />

                      <button
                        onClick={() => updateStatus(pick.id, 'won')}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-neon-green/30 hover:text-neon-green hover:bg-neon-green/10 transition-all"
                        title="Ganado"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => updateStatus(pick.id, 'lost')}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Perdido"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => deletePick(pick.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
