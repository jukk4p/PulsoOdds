'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, CheckCircle, XCircle, MinusCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPicksPage() {
  const [picks, setPicks] = useState<any[]>([]);
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

  return (
    <div className="space-y-6 text-center sm:text-left">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 mb-8">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
            GESTIÓN DE <span className="text-neon-green">PICKS</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Panel de control y resultados en tiempo real.</p>
        </div>
        <button className="w-fit self-center sm:self-auto bg-neon-green text-deep-black font-black px-10 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,135,0.5)] transition-all active:scale-95 text-[11px] tracking-tighter uppercase mb-2 sm:mb-0">
          <Plus className="h-5 w-5 stroke-[3px]" /> Nuevo Pronóstico
        </button>
      </div>

      {/* Main Content Area */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01]">
        {/* MOBILE VIEW: Card List */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-12 text-center text-white/20 italic">Cargando picks...</div>
          ) : picks.length === 0 ? (
            <div className="p-12 text-center text-white/20 italic">No hay picks registrados.</div>
          ) : (
            picks.map((pick) => (
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
                    <button onClick={() => deletePick(pick.id)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 text-white/20 border border-white/10 ml-2">
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
                <th className="px-6 py-5 font-black text-neon-green">Evento / Deporte</th>
                <th className="px-6 py-5 font-black">Mercado / Pronóstico</th>
                <th className="px-6 py-5 font-black text-center">Cuota / S</th>
                <th className="px-6 py-5 font-black">Estado</th>
                <th className="px-6 py-5 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">Cargando picks...</td>
                </tr>
              ) : picks.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">No hay picks registrados.</td>
                </tr>
              ) : (
                picks.map((pick) => (
                  <tr key={pick.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold leading-tight mb-0.5">{pick.match}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black">{pick.sport} • {pick.competition}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] text-white/40 uppercase font-bold mb-0.5">{pick.market}</p>
                      <p className="text-neon-green font-black uppercase text-sm">{pick.pick}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <p className="text-white font-black font-mono">@{pick.odds.toFixed(2)}</p>
                       <p className="text-[10px] text-white/20 font-bold uppercase">Stake {pick.stake}</p>
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
                        <button onClick={() => deletePick(pick.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/10 hover:text-white transition-all ml-2" title="Eliminar">
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
