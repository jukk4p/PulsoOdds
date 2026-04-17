import { Zap } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-deep-black text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/20 px-3 py-1 rounded-full text-neon-green text-[10px] font-black uppercase tracking-widest mb-8">
          <Zap className="h-3 w-3 fill-current" />
          Transparencia Técnica
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6">
          POLÍTICA DE <span className="text-neon-green">COOKIES</span>
        </h1>
        
        <p className="text-white/40 mb-12 font-medium">Última actualización: 17 de abril de 2026</p>

        <div className="space-y-12 text-white/70 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se descargan en su dispositivo al visitar un sitio web. Ayudan a que la plataforma funcione correctamente y a que su experiencia de usuario sea más fluida.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">2. ¿Qué Cookies Utilizamos?</h2>
            <p>
              En PulsoOdds utilizamos principalmente cookies de tres tipos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neon-green/80">
              <li><strong>Técnicas:</strong> Esenciales para que la web funcione (mantenimiento de sesión, seguridad).</li>
              <li><strong>De Preferencia:</strong> Para recordar sus ajustes (idioma, preferencias de visualización).</li>
              <li><strong>De Análisis:</strong> Para entender de forma anónima cómo se usa la web y mejorarla.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Control de Cookies</h2>
            <p>
              Usted tiene el control total sobre las cookies. Puede bloquearlas o eliminarlas a través de los ajustes de su navegador. Tenga en cuenta que desactivar ciertas cookies puede afectar a la funcionalidad de algunas secciones de la web.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Cookies de Terceros</h2>
            <p>
              En algunos casos, utilizamos servicios de terceros (como Supabase para la autenticación) que pueden instalar cookies técnicas necesarias para su funcionamiento seguro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">5. Actualizaciones</h2>
            <p>
              Podemos actualizar nuestra política de cookies periódicamente para reflejar cambios técnicos o regulatorios. Le recomendamos revisar esta página de vez en cuando.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
