# 🟢 PulsoOdds

> **Autonomous AI-Driven Sports Betting Hub**  
> Una plataforma de alto rendimiento que combina inteligencia artificial, automatización con n8n y una interfaz premium para el análisis de apuestas deportivas.

![PulsoOdds Hero](https://images.unsplash.com/photo-1508919893251-17389adce3d7?q=80&w=1200&auto=format&fit=crop)

## 🚀 Vision
PulsoOdds no es solo una web de picks; es un ecosistema autónomo. Utiliza modelos de lenguaje avanzados (Claude/GPT) para analizar datos estadísticos en tiempo real, calcular el valor esperado (EV) y publicar pronósticos verificados automáticamente.

## ✨ Características Principales
- **🤖 Bot de Análisis IA**: Flujo en n8n que escanea ligas europeas, filtra por valor (EV > 1.05) y genera análisis profesionales.
- **📊 Dashboard de Estadísticas**: Seguimiento en tiempo real de ROI, Win Rate y evolución de beneficios mediante Chart.js.
- **⚡ Arquitectura Moderna**: Construido con Next.js 16 (App Router), Tailwind CSS 4 y Supabase.
- **🔒 Seguridad Robusta**: Endpoint de ingesta protegido mediante API Key y Row Level Security (RLS) en base de datos.
- **📱 Notificaciones Multi-canal**: Alertas automáticas vía Telegram cada vez que se detecta una oportunidad de valor.

## 🛠️ Stack Tecnológico
- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Automatización**: [n8n](https://n8n.io/)
- **Gráficos**: [Chart.js](https://www.chartjs.org/)
- **IA**: Anthropic Claude / OpenAI GPT-4

## ⚙️ Configuración del Proyecto

### Variables de Entorno
Crea un archivo `.env.local` con las siguientes claves:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
ADMIN_API_KEY=tu-clave-secreta-para-n8n
```

### Inicialización de Base de Datos
Ejecuta el script `supabase_schema.sql` en el SQL Editor de Supabase para crear las tablas y tipos necesarios.

### Automatización (n8n)
El workflow de n8n requiere:
1. Conexión con **API-Sports** (Football V3).
2. Credenciales de Telegram (Bot Token).
3. Configuración del nodo **Basic LLM Chain** con el prompt de analista experto suministrado.

## 📂 Estructura
```text
src/
├── app/        # Rutas y API Endpoints
├── components/ # Componentes UI (Neon-Dark Design)
├── lib/        # Utilidades y cliente Supabase
└── types/      # Definiciones de TypeScript
```

## 🤝 Contribuciones
Este es un proyecto diseñado para la excelencia en el trading deportivo. Si tienes ideas para mejorar los modelos de predicción o la visualización de datos, ¡eres bienvenido!

---
Desarrollado con ❤️ para la comunidad de apostadores inteligentes.
