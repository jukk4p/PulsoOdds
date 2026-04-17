import { Zap } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-deep-black text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/20 px-3 py-1 rounded-full text-neon-green text-[10px] font-black uppercase tracking-widest mb-8">
          <Zap className="h-3 w-3 fill-current" />
          Documentación Legal
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6">
          TÉRMINOS Y <span className="text-neon-green">CONDICIONES</span>
        </h1>
        
        <p className="text-white/40 mb-12 font-medium">Última actualización: 17 de abril de 2026</p>

        <div className="space-y-12 text-white/70 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar PulsoOdds, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra plataforma ni sus servicios.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">2. Naturaleza del Servicio</h2>
            <p>
              PulsoOdds es una plataforma de análisis deportivo e información. No somos un sitio de apuestas. El contenido proporcionado, incluyendo los "picks" o pronósticos, tiene fines puramente informativos y educativos.
            </p>
            <div className="bg-white/5 border-l-2 border-neon-green p-6 italic rounded-r-xl">
              "El éxito pasado en el análisis deportivo no garantiza resultados futuros. El riesgo de pérdida es inherente a la actividad deportiva."
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Juego Responsable</h2>
            <p>
              Fomentamos encarecidamente el juego responsable. Los usuarios deben ser mayores de 18 años (o la edad legal en su jurisdicción). Si cree que puede tener un problema con el juego, le instamos a buscar ayuda profesional en organizaciones especializadas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, logotipos, diseños y análisis publicados en PulsoOdds son propiedad exclusiva de la plataforma. Queda prohibida la reproducción, distribución o reventa no autorizada de nuestra información.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">5. Limitación de Responsabilidad</h2>
            <p>
              PulsoOdds no se hace responsable de las pérdidas financieras derivadas del uso de nuestra información. Cada usuario es el único responsable de sus decisiones económicas y de gestión de riesgos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">6. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la plataforma tras los cambios constituirá la aceptación de los mismos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
