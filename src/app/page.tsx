export const dynamic = "force-dynamic";
export const revalidate = 0;

import { TrendingUp, Target, Zap } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Fuerza la carga de datos frescos en cada visita

async function getData() {
  const { data: picks, error } = await supabase
    .from('picks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: allPicks } = await supabase.from('picks').select('*');
  
  const stats = calculateStats(allPicks || []);
  return { recentPicks: picks || [], stats };
}

export default async function Home() {
  const { recentPicks, stats } = await getData();

  return (
    <div className="bg-deep-black min-h-screen text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-deep-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black italic tracking-tighter">
            PULSO<span className="text-neon-green">ODDS</span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-white/70">
            <Link href="/picks" className="hover:text-neon-green transition-colors">Picks</Link>
            <Link href="/stats" className="hover:text-neon-green transition-colors">Estadísticas</Link>
            <Link href="/admin" className="hover:text-neon-green transition-colors">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-green/10 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/20 px-3 py-1 rounded-full text-neon-green text-xs font-bold uppercase mb-6">
                <Zap className="h-3 w-3 fill-current" />
                Plataforma Premium de Tipsters
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
                TU VENTAJA <br />
                <span className="text-neon-green">ELÉCTRICA</span>
              </h1>
              <p className="text-xl text-white/50 max-w-lg mb-10 leading-relaxed">
                Análisis deportivo de alto impacto con datos precisos y rentabilidad verificada. 
                Sin rodeos, solo resultados.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/picks" className="bg-neon-green text-deep-black font-bold px-8 py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] transition-all">
                  Ver Pronósticos
                </Link>
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                     <div key={i} className="h-12 w-12 rounded-full border-2 border-deep-black bg-dark-grey" />
                  ))}
                  <div className="h-12 flex items-center pl-6 text-sm text-white/40 font-medium">
                    +500 Apostadores confían
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="ROI MENSUAL" value={`${stats.roi.toFixed(1)}%`} icon={<TrendingUp className="h-5 w-5" />} color="neon" />
              <StatCard label="ACIERTO" value={`${stats.winRate.toFixed(1)}%`} icon={<Target className="h-5 w-5" />} color="white" />
              <StatCard label="RACHA ACTUAL" value={stats.currentStreak > 0 ? `+${stats.currentStreak}` : stats.currentStreak} icon={<Zap className="h-5 w-5" />} color="neon" />
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-center">
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">UNIDADES</p>
                <p className="text-3xl font-black text-white">{stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Latest Picks */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black">ÚLTIMOS <span className="text-neon-green">PICKS</span></h2>
              <p className="text-white/40">Lo más reciente de nuestros expertos</p>
            </div>
            <Link href="/picks" className="text-neon-green text-sm font-bold border-b border-neon-green/30 hover:border-neon-green transition-all pb-1">
              Ver todos
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPicks.map((pick) => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: 'neon' | 'white' }) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-colors", 
        color === 'neon' ? "bg-neon-green/20 text-neon-green" : "bg-white/10 text-white")}>
        {icon}
      </div>
      <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}
