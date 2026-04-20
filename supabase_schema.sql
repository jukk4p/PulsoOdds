-- Script SQL para Supabase Dashboard -> SQL Editor
-- Actualizado con campos de logos, análisis avanzado y estadísticas

-- 1. Crear el tipo ENUM para el estado del pick
DO $$ BEGIN
    CREATE TYPE pick_status AS ENUM ('pending', 'won', 'lost', 'void');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear la tabla de picks
CREATE TABLE IF NOT EXISTS picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Información del Partido
    sport TEXT NOT NULL DEFAULT 'football',
    competition TEXT NOT NULL,
    match TEXT NOT NULL,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    kickoff TEXT, -- Hora en formato HH:mm
    
    -- Logos (URLs o rutas locales)
    league_logo TEXT,
    home_logo TEXT,
    away_logo TEXT,
    
    -- Información de la Apuesta
    market TEXT NOT NULL,
    pick TEXT NOT NULL,
    odds DECIMAL(10, 2) NOT NULL,
    stake INTEGER CHECK (stake >= 1 AND stake <= 10),
    confianza INTEGER DEFAULT 70,
    ev DECIMAL(10, 2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    
    -- Análisis Detallado
    razonamiento TEXT, -- Antiguo 'analysis'
    alertas TEXT,      -- JSON o string con lista de riesgos
    factores TEXT,     -- JSON o string con lista de pros
    
    -- Estadísticas (JSONB para flexibilidad)
    home_stats JSONB DEFAULT '{}'::jsonb,
    away_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Estado y Metadatos
    status pick_status DEFAULT 'pending',
    result_odds DECIMAL(10, 2),
    source TEXT DEFAULT 'n8n-bot'
);

-- 3. Índices para optimizar filtros
CREATE INDEX IF NOT EXISTS idx_picks_sport ON picks(sport);
CREATE INDEX IF NOT EXISTS idx_picks_status ON picks(status);
CREATE INDEX IF NOT EXISTS idx_picks_match_date ON picks(match_date);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

-- 5. Políticas
DO $$ BEGIN
    CREATE POLICY "Lectura pública de picks" ON picks FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Gestión total service_role" ON picks USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
