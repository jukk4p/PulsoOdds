import { PicksExplorer } from "@/components/picks/PicksExplorer";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
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
        <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            PRONÓSTICOS <span className="text-neon-green">ACTIVOS</span>
          </h1>
          <p className="text-white/60 max-w-2xl text-center">
            Explora las mejores oportunidades del mercado analizadas por nuestro equipo de expertos. 
            Transparencia total en todos nuestros resultados.
          </p>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-6">
        <PicksExplorer initialPicks={picks} />
      </div>
    </div>
  );
}
