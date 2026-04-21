# PulsoOdds

Plataforma de gestión y análisis de pronósticos deportivos. PulsoOdds combina una interfaz moderna para la visualización de datos con un backend robusto basado en Supabase para el seguimiento de picks y estadísticas.

![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)

---

## 🚀 Funcionalidades Principales

- **Dashboard de Analíticas**: Cálculo en tiempo real de ROI, Yield (Profit) y Win Rate basado en el historial de picks.
- **Gestión de Picks**: Panel de administración para la creación, edición y seguimiento de pronósticos deportivos.
- **Autenticación Segura**: Acceso restringido al panel de administración mediante filtros de correo certificado y Supabase Auth.
- **Visualización Optimizada**: Interfaz optimizada para móviles (Mobile-First) con un sistema de visualización de alta densidad para picks.
- **Integración con Automatizaciones**: Compatible con flujos de **n8n** para la ingesta de datos desde API-Sports.

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
```

### 4. Ejecución en Local
```bash
npm run dev
```

## 📂 Arquitectura del Proyecto

```text
src/
├── app/          # Estructura de rutas y layouts
├── components/   # Componentes de UI y layout reutilizables
├── lib/          # Clientes de base de datos y utilidades de lógica
└── types/        # Definiciones de TypeScript para modelos de datos
```

## 📜 Licencia
Este proyecto está bajo la Licencia MIT.
