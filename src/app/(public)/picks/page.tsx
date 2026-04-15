import { PickCard } from "@/components/ui/PickCard";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

async function getPicks() {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .order('match_date', { ascending: false });

  if (error) {
    console.error('Error fetching picks:', error);
    return [];
  }
  return data;
}

export default async function PicksPage() {
  const picks = await getPicks();

  return (
    <div className="min-h-screen bg-deep-black pb-20">
      <header className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            PRONÓSTICOS <span className="text-neon-green">ACTIVOS</span>
          </h1>
          <p className="text-white/60 max-w-2xl">
            Explora las mejores oportunidades del mercado analizadas por nuestro equipo de expertos. 
            Transparencia total en todos nuestros resultados.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filters Placeholder */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {['Todos', 'Fútbol', 'Tenis', 'Baloncesto', 'E-Sports'].map((filter) => (
            <button key={filter} className="px-5 py-2 rounded-full border border-white/10 text-white/70 text-sm hover:border-neon-green hover:text-white transition-all whitespace-nowrap">
              {filter}
            </button>
          ))}
        </div>

        {picks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {picks.map((pick) => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl border border-white/5">
            <p className="text-white/40 italic">No hay picks disponibles en este momento. ¡Vuelve pronto!</p>
          </div>
        )}
      </div>
    </div>
  );
}
