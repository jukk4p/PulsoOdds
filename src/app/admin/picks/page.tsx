'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, CheckCircle, XCircle, MinusCircle, Plus, Search, ShieldCheck } from 'lucide-react';
import { cn, normalizeBettingPick, translateBettingTerm } from '@/lib/utils';

export default function AdminPicksPage() {
  const [picks, setPicks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPicks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('picks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setPicks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPicks();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('picks')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setPicks(picks.map(p => p.id === id ? { ...p, status } : p));
    }
  };

  const deletePick = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este pick?')) return;
    const { error } = await supabase
      .from('picks')
      .delete()
      .eq('id', id);

    if (!error) {
      setPicks(picks.filter(p => p.id !== id));
    }
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

  const handleValidateAll = async () => {
    const pendingPicks = picks.filter(p => !p.is_verified && p.status === 'pending');
    
    if (pendingPicks.length === 0) {
      alert('¡Nada que hacer! Todos los picks actuales ya están verificados o cerrados.');
      return;
    }

    if (!confirm(`Se intentarán sincronizar ${pendingPicks.length} picks pendientes. ¿Continuar?`)) return;
    
    setLoading(true);
    let updatedCount = 0;
    let noMatchCount = 0;
    let skippedCount = picks.length - pendingPicks.length;
    
    try {
      // Intentamos detectar el deporte del primer pick para ser un poco más dinámicos
      const firstSport = pendingPicks[0].sport_key || 'soccer_germany_bundesliga';
      const resp = await fetch(`/api/odds?sport=${firstSport}`);
      const data = await resp.json();
      
      if (data.error || !Array.isArray(data)) {
        throw new Error(data.error || 'No se pudieron obtener datos del mercado');
      }

      // Procesamos solo los pendientes
      for (const pick of pendingPicks) {
        const match = data.find((event: any) => 
          pick.match.toLowerCase().includes(event.home_team.toLowerCase()) ||
          pick.match.toLowerCase().includes(event.away_team.toLowerCase())
        );

        if (match) {
          const bookmaker = match.bookmakers[0];
          if (bookmaker) {
            const isBTTSPick = pick.market.toLowerCase().includes('marcan') || pick.market.toLowerCase().includes('btts');
            const marketKey = isBTTSPick ? 'btts' : 'h2h';
            const market = bookmaker.markets.find((m: any) => m.key === marketKey);
            
            if (market) {
              let outcome = null;
              if (market.key === 'btts') {
                const isYes = pick.pick.toLowerCase().includes('sí') || pick.pick.toLowerCase().includes('yes');
                outcome = market.outcomes.find((o: any) => 
                  isYes ? o.name.toLowerCase() === 'yes' : o.name.toLowerCase() === 'no'
                );
              } else {
                outcome = market.outcomes.find((o: any) => 
                  pick.pick.toLowerCase().includes(o.name.toLowerCase())
                ) || market.outcomes[0];
              }

              if (outcome) {
                await supabase
                  .from('picks')
                  .update({ odds: outcome.price, is_verified: true })
                  .eq('id', pick.id);
                updatedCount++;
                continue;
              }
            }
          }
        }
        noMatchCount++;
      }
      
      alert(
        `Sincronización masiva completada.\n\n` +
        `✅ Actualizados: ${updatedCount}\n` +
        `⚠️ No encontrados en mercado: ${noMatchCount}\n` +
        `⏭️ Saltados (ya cerrados/listos): ${skippedCount}`
      );
      fetchPicks();
    } catch (err: any) {
      alert(`Error en sincronización: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPicks = picks.filter(p => 
    p.match.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.competition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-center sm:text-left">
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

          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            <button 
              onClick={handleValidateAll}
              disabled={loading}
              className="flex-1 md:flex-none bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all active:scale-95 text-[11px] tracking-tighter uppercase disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" /> Validar Todo
            </button>
            <button className="flex-1 md:flex-none bg-neon-green text-deep-black font-black px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,135,0.5)] transition-all active:scale-95 text-[11px] tracking-tighter uppercase">
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
              <div key={pick.id} className="p-5 space-y-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white font-black leading-tight mb-1">{pick.match}</p>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{pick.sport} • {pick.competition}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-lg font-mono text-neon-green leading-none">@{pick.odds.toFixed(2)}</span>
                    <span className="text-xs text-white/20 font-bold">Stake {pick.stake}/10</span>
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
                        <p className="text-neon-green font-black uppercase text-sm">{normalizeBettingPick(pick.pick)}</p>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between gap-4">
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
                  <tr key={pick.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6 border-b border-white/5">
                      <p className="text-white font-bold leading-none mb-1.5 whitespace-nowrap">{pick.match}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest whitespace-nowrap">{pick.sport} • {pick.competition}</p>
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
                            <p className="text-neon-green font-black uppercase text-sm whitespace-nowrap">{normalizeBettingPick(pick.pick)}</p>
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
                    <td className="px-6 py-4 text-right">
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
