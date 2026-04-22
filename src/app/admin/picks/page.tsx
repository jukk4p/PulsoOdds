'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, CheckCircle, XCircle, MinusCircle, Plus, Search, ShieldCheck, TrendingUp } from 'lucide-react';
import { cn, normalizeBettingPick, translateBettingTerm, substituteTeamNames, translateLeagueName, formatMatchName } from '@/lib/utils';

export default function AdminPicksPage() {
  const [picks, setPicks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());

  const fetchPicks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('picks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setPicks(data || []);
      // Limpiar selección después de recargar
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
        // Buscamos el partido por matching de nombre (fuzzy simple)
        const match = data.find((event: any) => 
          pick.match.toLowerCase().includes(event.home_team.toLowerCase()) ||
          pick.match.toLowerCase().includes(event.away_team.toLowerCase())
        );
        
        if (match) {
          // Intentamos extraer la cuota del mercado correspondiente (h2h o btts)
          const bookmaker = match.bookmakers[0]; // Usamos el primero (suele ser el más real/liquid)
          if (bookmaker) {
            const market = bookmaker.markets.find((m: any) => 
              m.key === 'h2h' || m.key === 'btts'
            );
            if (market) {
               // Aquí iría la lógica de selección específica según el pick.pick
               // Por ahora sugerimos la primera cuota encontrada o dejamos que el user elija
               suggestedOdd = market.outcomes[0].price;
            }
          }
        }
      }

      const manualOdd = prompt(
        suggestedOdd 
          ? `¡Partido encontrado en el mercado real!\nCuota sugerida: @${suggestedOdd}\n\nIntroduce la cuota real definitiva para validar:` 
          : `No pudimos encontrar el mercado automático para "${pick.match}".\n\nPor favor, introduce la cuota real que has verificado manualmente para este pick:`,
        suggestedOdd || pick.odds
      );

      if (manualOdd && !isNaN(parseFloat(manualOdd))) {
        const { error } = await supabase
          .from('picks')
          .update({ 
            odds: parseFloat(manualOdd), 
            is_verified: true 
          })
          .eq('id', pick.id);
          
        if (!error) {
          fetchPicks();
        }
      }
    } catch (err) {
      alert("Error al conectar con el servicio de cuotas.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAssets = () => {
    const GENERIC_SHIELD = "https://img.icons8.com/ios-filled/100/ffffff/shield.png";
    const GENERIC_LEAGUE = "https://img.icons8.com/ios-filled/100/ffffff/trophy.png";

    const pendingPicks = picks.filter(p => p.status === 'pending');
    const missingHome = pendingPicks.filter(p => !p.home_logo || p.home_logo.includes('shield.png'));
    const missingAway = pendingPicks.filter(p => !p.away_logo || p.away_logo.includes('shield.png'));
    const missingLeague = pendingPicks.filter(p => !p.league_logo || p.league_logo.includes('trophy.png'));
    
    const uniqueTeams = Array.from(new Set([
      ...missingHome.map(p => p.match.split(/\s+vs\s+/i)[0]),
      ...missingAway.map(p => p.match.split(/\s+vs\s+/i)[1])
    ])).filter(Boolean);

    alert(
      `📊 AUDITORÍA DE ACTIVOS (Logos):\n\n` +
      `⚽ EQUIPOS SIN ESCUDO: ${uniqueTeams.length}\n` +
      `🏆 LIGAS SIN LOGO: ${new Set(missingLeague.map(p => p.competition)).size}\n\n` +
      `📋 ACCIÓN RECOMENDADA:\n` +
      `Verifica que las imágenes existan en "/public/logos/" con el ID correcto.`
    );
  };

  const handleNewPick = () => {
    alert("🚀 MÓDULO DE CREACIÓN MANUAL (v7.0)\n\nEsta función estará disponible en la próxima actualización. Por ahora, sigue publicando a través del comando /picks del bot en Telegram.");
  };

  const handleTranslateAudit = async () => {
    if (!confirm('Esta herramienta buscará picks con términos en inglés o técnicos (mercados, selecciones y ligas) y los actualizará automáticamente al español pro. ¿Deseas continuar?')) return;
    
    setLoading(true);
    let updatedCount = 0;
    
    try {
      const { data: allPicks, error } = await supabase.from('picks').select('*').eq('status', 'pending');
      if (error) throw error;
 
      const updates = allPicks.filter(p => {
        const newMarket = translateBettingTerm(p.market);
        const newPick = translateBettingTerm(p.pick);
        const newLeague = translateLeagueName(p.competition);
        const newMatch = formatMatchName(p.match);
        return newMarket !== p.market || newPick !== p.pick || newLeague !== p.competition || newMatch !== p.match;
      });
 
      if (updates.length === 0) {
        alert('✅ ¡Limpieza total! Todos los términos ya están normalizados.');
        return;
      }
 
      for (const p of updates) {
        const { error: upError } = await supabase
          .from('picks')
          .update({
            market: translateBettingTerm(p.market),
            pick: translateBettingTerm(p.pick),
            competition: translateLeagueName(p.competition),
            match: formatMatchName(p.match)
          })
          .eq('id', p.id);
        
        if (!upError) updatedCount++;
      }
 
      alert(`🚀 ¡Auditoría completada!\n\nSe han corregido y traducido ${updatedCount} registros (equipos, mercados y ligas) en tu histórico.`);
      fetchPicks();
    } catch (err) {
      alert("Error durante la auditoría de traducciones.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPicks = picks.filter(p => 
    p.match.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.competition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    translateLeagueName(p.competition).toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-center sm:text-left">
      {/* Bulk Action Bar (Floating/Sticky) */}
      {selectedPicks.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-deep-black/90 backdrop-blur-xl border border-neon-green/30 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-neon-green font-black text-lg tracking-tighter leading-none">{selectedPicks.size}</span>
              <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Seleccionados</span>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div className="flex items-center gap-2">
              <button 
                onClick={() => bulkUpdateStatus('won')}
                className="bg-neon-green/10 text-neon-green hover:bg-neon-green/20 p-2.5 rounded-xl transition-all group"
                title="Marcar como Ganados"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={() => bulkUpdateStatus('lost')}
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 p-2.5 rounded-xl transition-all"
                title="Marcar como Perdidos"
              >
                <XCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={() => bulkUpdateStatus('void')}
                className="bg-white/5 text-white/40 hover:bg-white/10 p-2.5 rounded-xl transition-all"
                title="Marcar como Nulos"
              >
                <MinusCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={bulkDelete}
                className="bg-white/5 text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all ml-2"
                title="Eliminar Selección"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <button 
              onClick={() => setSelectedPicks(new Set())}
              className="text-[10px] text-white/20 hover:text-white uppercase font-black tracking-widest ml-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
            GESTIÓN DE <span className="text-neon-green">PICKS</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Panel de control y resultados en tiempo real.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-neon-green transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por equipo, liga, mercado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
            <button 
              onClick={handleCheckAssets}
              className="flex-1 md:flex-none bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all active:scale-95 text-[10px] tracking-tighter uppercase"
            >
              <ShieldCheck className="h-4 w-4" /> Logos
            </button>
            <button 
              onClick={handleTranslateAudit}
              className="flex-1 md:flex-none bg-purple-600/20 text-purple-400 border-2 border-purple-500/30 font-black px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-purple-600 hover:text-white transition-all active:scale-95 text-[10px] tracking-widest uppercase shadow-[0_0_20px_rgba(168,85,247,0.15)] group"
            >
              <TrendingUp className="h-5 w-5 group-hover:scale-125 transition-transform" /> Normalizar Historial
            </button>
            <button 
              onClick={handleNewPick}
              className="flex-1 md:flex-none bg-neon-green text-deep-black font-black px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,135,0.5)] transition-all active:scale-95 text-[11px] tracking-tighter uppercase"
            >
              <Plus className="h-5 w-5 stroke-[3px]" /> Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01]">
        {/* MOBILE VIEW: Card List */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-12 text-center text-white/20 italic">Cargando picks...</div>
          ) : filteredPicks.length === 0 ? (
            <div className="p-12 text-center text-white/20 italic">No se encontraron resultados.</div>
          ) : (
            filteredPicks.map((pick) => (
              <div 
                key={pick.id} 
                className={cn(
                  "p-5 space-y-4 hover:bg-white/[0.02] transition-colors relative",
                  selectedPicks.has(pick.id) && "bg-neon-green/[0.03] border-l-2 border-neon-green"
                )}
                onClick={() => toggleSelectOne(pick.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white font-black leading-tight mb-1">{formatMatchName(pick.match)}</p>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{pick.sport} • {translateLeagueName(pick.competition)}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-lg font-mono text-neon-green leading-none">@{pick.odds.toFixed(2)}</span>
                      <span className="text-xs text-white/20 font-bold">Stake {pick.stake}/5</span>
                      {pick.published_at && (
                        <span className="text-[8px] text-neon-green/30 font-black uppercase mt-1">
                          Reg: {new Date(pick.published_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {/* Checkbox Móvil */}
                    <div className={cn(
                      "h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center",
                      selectedPicks.has(pick.id) ? "bg-neon-green border-neon-green" : "border-white/10 bg-white/5"
                    )}>
                      {selectedPicks.has(pick.id) && <CheckCircle className="h-4 w-4 text-deep-black stroke-[3px]" />}
                    </div>
                  </div>
                </div>

                {/* Detalle del Mercado y Pronóstico */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  {(() => {
                    const isBTTS = pick.market.toLowerCase().includes('btts') || pick.market.toLowerCase().includes('both teams');
                    const isYes = pick.pick.toLowerCase().includes('sí') || pick.pick.toLowerCase().includes('yes');
                    
                    if (isBTTS) {
                      return (
                        <>
                          <p className="text-[10px] text-white/30 uppercase font-black mb-0.5">Ambos marcan - {isYes ? 'SÍ' : 'NO'}</p>
                          <p className="text-neon-green font-black uppercase text-sm">AMBOS MARCAN</p>
                        </>
                      );
                    }

                    return (
                      <>
                        <p className="text-[10px] text-white/30 uppercase font-black mb-0.5">{translateBettingTerm(normalizeBettingPick(pick.market))}</p>
                        <p className="text-neon-green font-black uppercase text-sm">
                          {substituteTeamNames(normalizeBettingPick(pick.pick), pick.match)}
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                    pick.status === 'won' && "bg-neon-green/10 text-neon-green",
                    pick.status === 'lost' && "bg-red-500/10 text-red-500",
                    pick.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                    pick.status === 'void' && "bg-white/10 text-white/40"
                  )}>
                    {pick.status === 'pending' ? 'Pendiente' : pick.status === 'won' ? 'Ganado' : pick.status === 'lost' ? 'Perdido' : 'Nulo'}
                  </span>
                  
                  <div className="flex gap-1">
                    <button onClick={() => updateStatus(pick.id, 'won')} className="h-9 w-9 flex items-center justify-center rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => updateStatus(pick.id, 'lost')} className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => updateStatus(pick.id, 'void')} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 text-white/40 border border-white/10">
                      <MinusCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => deletePick(pick.id)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 text-white/20 border border-white/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* DESKTOP VIEW: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                <th className="px-6 py-5 font-black w-10">
                  <button 
                    onClick={toggleSelectAll}
                    className={cn(
                      "h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center",
                      selectedPicks.size === filteredPicks.length && filteredPicks.length > 0 
                        ? "bg-neon-green border-neon-green" 
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    )}
                  >
                    {selectedPicks.size === filteredPicks.length && filteredPicks.length > 0 && 
                      <CheckCircle className="h-4 w-4 text-deep-black stroke-[3px]" />
                    }
                  </button>
                </th>
                <th className="px-6 py-5 font-black text-neon-green whitespace-nowrap">Evento / Deporte</th>
                <th className="px-6 py-5 font-black whitespace-nowrap">Mercado / Pronóstico</th>
                <th className="px-6 py-5 font-black text-center whitespace-nowrap">Cuota / Stake</th>
                <th className="px-6 py-5 font-black whitespace-nowrap">Estado</th>
                <th className="px-6 py-5 font-black text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">Cargando picks...</td>
                </tr>
              ) : filteredPicks.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">No se encontraron resultados.</td>
                </tr>
              ) : (
                filteredPicks.map((pick) => (
                  <tr 
                    key={pick.id} 
                    onClick={() => toggleSelectOne(pick.id)}
                    className={cn(
                      "hover:bg-white/[0.02] transition-colors group cursor-pointer border-l-2 border-transparent",
                      selectedPicks.has(pick.id) && "bg-neon-green/[0.02] border-neon-green"
                    )}
                  >
                    <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => toggleSelectOne(pick.id)}
                        className={cn(
                          "h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center",
                          selectedPicks.has(pick.id) 
                            ? "bg-neon-green border-neon-green" 
                            : "border-white/10 bg-white/5 group-hover:border-white/30"
                        )}
                      >
                        {selectedPicks.has(pick.id) && <CheckCircle className="h-4 w-4 text-deep-black stroke-[3px]" />}
                      </button>
                    </td>
                    <td className="px-6 py-6 border-b border-white/5">
                      <p className="text-white font-bold leading-none mb-1.5 whitespace-nowrap">{formatMatchName(pick.match)}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest whitespace-nowrap">{pick.sport} • {translateLeagueName(pick.competition)}</p>
                    </td>
                    <td className="px-6 py-6 border-b border-white/5">
                      {(() => {
                        const isBTTS = pick.market.toLowerCase().includes('btts') || pick.market.toLowerCase().includes('both teams');
                        const isYes = pick.pick.toLowerCase().includes('sí') || pick.pick.toLowerCase().includes('yes');
                        
                        if (isBTTS) {
                          return (
                            <>
                              <p className="text-[11px] text-white/40 uppercase font-bold mb-1 whitespace-nowrap">Ambos marcan - {isYes ? 'SÍ' : 'NO'}</p>
                              <p className="text-neon-green font-black uppercase text-sm whitespace-nowrap">AMBOS MARCAN</p>
                            </>
                          );
                        }

                        return (
                          <>
                            <p className="text-[11px] text-white/40 uppercase font-bold mb-1 whitespace-nowrap">{translateBettingTerm(normalizeBettingPick(pick.market))}</p>
                            <p className="text-neon-green font-black uppercase text-sm whitespace-nowrap">
                              {substituteTeamNames(normalizeBettingPick(pick.pick), pick.match)}
                            </p>
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-6 border-b border-white/5 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-black font-mono">@{pick.odds.toFixed(2)}</p>
                          {pick.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />}
                        </div>
                        <p className="text-[10px] text-white/20 font-bold uppercase whitespace-nowrap">Stake {pick.stake}</p>
                        {pick.published_at && (
                          <p className="text-[8px] text-neon-green/30 font-black uppercase mt-1 truncate max-w-[100px]">
                            {new Date(pick.published_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider",
                        pick.status === 'won' && "bg-neon-green/10 text-neon-green",
                        pick.status === 'lost' && "bg-red-500/10 text-red-500",
                        pick.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                        pick.status === 'void' && "bg-white/10 text-white/40"
                      )}>
                        {pick.status === 'pending' ? 'Pendiente' : pick.status === 'won' ? 'Ganado' : pick.status === 'lost' ? 'Perdido' : 'Nulo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateStatus(pick.id, 'won')} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neon-green/20 text-white/10 hover:text-neon-green transition-all" title="Ganado">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => updateStatus(pick.id, 'lost')} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-white/10 hover:text-red-500 transition-all" title="Perdido">
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => updateStatus(pick.id, 'void')} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all" title="Nulo">
                          <MinusCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => deletePick(pick.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
