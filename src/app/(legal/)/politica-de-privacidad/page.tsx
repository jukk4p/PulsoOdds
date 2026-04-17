import { Zap } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-deep-black text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/20 px-3 py-1 rounded-full text-neon-green text-[10px] font-black uppercase tracking-widest mb-8">
          <Zap className="h-3 w-3 fill-current" />
          Protección de Datos
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6">
          POLÍTICA DE <span className="text-neon-green">PRIVACIDAD</span>
        </h1>
        
        <p className="text-white/40 mb-12 font-medium">Última actualización: 17 de abril de 2026</p>

        <div className="space-y-12 text-white/70 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Información que Recopilamos</h2>
            <p>
              Recopilamos la información estrictamente necesaria para proporcionar nuestros servicios. Esto puede incluir su nombre, dirección de correo electrónico y datos de navegación básicos para mejorar la experiencia técnica.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">2. Uso de la Información</h2>
            <p>
              Utilizamos sus datos exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neon-green/80">
              <li>S gestionar su acceso al panel de usuario/administrador.</li>
              <li>S enviar actualizaciones críticas de la plataforma.</li>
              <li>S prevenir actividades fraudulentas o ataques técnicos.</li>
              <li>S mejorar nuestro motor de análisis deportivo.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad de vanguardia, incluyendo cifrado SSL y protocolos de autenticación robustos vía Supabase, para garantizar que su información personal permanezca privada y protegida.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Terceras Partes</h2>
            <p>
              PulsoOdds no vende, alquila ni comparte su información personal con terceros para fines comerciales. Solo compartimos datos cuando es técnicamente necesario (ej: proveedores de infraestructura) o por requerimiento legal.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">5. Sus Derechos</h2>
            <p>
              Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento. Puede ejercer estos derechos contactándonos a través de los canales oficiales de soporte.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">6. Consentimiento</h2>
            <p>
              Al utilizar nuestra plataforma, usted consiente el tratamiento de sus datos tal como se describe en esta política de privacidad.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
