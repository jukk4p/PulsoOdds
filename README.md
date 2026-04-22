# PulsoOdds

Plataforma de gestión y análisis de pronósticos deportivos. PulsoOdds combina una interfaz moderna para la visualización de datos con un backend robusto basado en Supabase para el seguimiento de picks y estadísticas.

![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)

---

## 🚀 Funcionalidades Principales

- **Dashboard de Analíticas**: Cálculo en tiempo real de ROI, Yield (Profit) y Win Rate basado en el historial de picks.
- **Pipeline de Datos Automatizado**: Scraping avanzado de Flashscore sincronizado con Google Sheets y Supabase vía n8n.
- **Diccionario Maestro**: Sistema de mapeo triple (Origen -> API -> Público) para garantizar consistencia de nombres y logos en toda la plataforma.
- **Clasificaciones en Tiempo Real**: Visualización de standings alineada con el diseño premium de la web y datos del diccionario.
- **Gestión de Picks**: Panel de administración para la creación, edición y seguimiento de pronósticos deportivos.

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16.2 (App Router) y React 19.
- **Estilos**: Tailwind CSS 4.0 con sistema de diseño oscuro y tokens personalizados.
- **Base de Datos & Auth**: Supabase (PostgreSQL) con políticas de seguridad (RLS).
- **Iconografía**: Lucide React.
- **Lógica de Datos**: Utilidades personalizadas para el cálculo estadístico deportivo.

## ⚙️ Configuración e Instalación

### 1. Requisitos Previos
- Node.js 18+
- Una instancia de Supabase activa.

### 2. Pasos de Instalación
```bash
# Clonar el repositorio
git clone https://github.com/jukk4p/PulsoOdds.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### 3. Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
N8N_WEBHOOK_URL=url-de-tu-webhook-n8n
```

### 4. Ejecución en Local
```bash
npm run dev
```

## 📂 Arquitectura del Proyecto

```text
src/              # Aplicación Next.js
scripts/          # Scripts de automatización y scraping
public/           # Assets estáticos y JSON de clasificaciones
diccionario_maestro_equipos.md  # Fuente de verdad para mapeo de equipos
```

## 📜 Licencia
Este proyecto está bajo la Licencia MIT.
