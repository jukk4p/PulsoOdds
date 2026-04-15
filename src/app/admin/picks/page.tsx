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
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-white">GESTIÓN DE <span className="text-neon-green">PICKS</span></h1>
          <p className="text-white/40">Administra, actualiza estados y elimina pronósticos.</p>
        </div>
        <button className="bg-neon-green text-deep-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,135,0.3)] transition-all">
          <Plus className="h-4 w-4" /> Nuevo Pick
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-bold text-neon-green">Evento / Deporte</th>
                <th className="px-6 py-4 font-bold">Mercado / Pick</th>
                <th className="px-6 py-4 font-bold">Cuota</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-10 text-center text-white/20 italic">Cargando picks...</td>
                </tr>
              ) : picks.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-10 text-center text-white/20 italic">No hay picks registrados.</td>
                </tr>
              ) : (
                picks.map((pick) => (
                  <tr key={pick.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{pick.match}</p>
                      <p className="text-xs text-white/40">{pick.sport} • {pick.competition}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/80">{pick.market}</p>
                      <p className="text-neon-green font-medium">{pick.pick}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-white font-mono">@{pick.odds}</span>
                       <span className="text-[10px] text-white/40 ml-2">S{pick.stake}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        pick.status === 'won' && "bg-neon-green/10 text-neon-green",
                        pick.status === 'lost' && "bg-red-500/10 text-red-500",
                        pick.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                        pick.status === 'void' && "bg-white/10 text-white/40"
                      )}>
                        {pick.status === 'pending' ? 'Pendiente' : pick.status === 'won' ? 'Ganado' : pick.status === 'lost' ? 'Perdido' : 'Nulo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateStatus(pick.id, 'won')} className="p-2 hover:text-neon-green text-white/20" title="Marcar Ganado">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => updateStatus(pick.id, 'lost')} className="p-2 hover:text-red-500 text-white/20" title="Marcar Perdido">
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => updateStatus(pick.id, 'void')} className="p-2 hover:text-white text-white/20" title="Marcar Nulo">
                          <MinusCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => deletePick(pick.id)} className="p-2 hover:text-red-500 text-white/20 ml-2" title="Eliminar">
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
