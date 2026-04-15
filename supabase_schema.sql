-- Script SQL para Supabase Dashboard -> SQL Editor

-- 1. Crear el tipo ENUM para el estado del pick
CREATE TYPE pick_status AS ENUM ('pending', 'won', 'lost', 'void');

-- 2. Crear la tabla de picks
CREATE TABLE picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sport TEXT NOT NULL,
    competition TEXT NOT NULL,
    match TEXT NOT NULL,
    market TEXT NOT NULL,
    pick TEXT NOT NULL,
    odds DECIMAL(10, 2) NOT NULL,
    stake INTEGER CHECK (stake >= 1 AND stake <= 10),
    analysis TEXT,
    status pick_status DEFAULT 'pending',
    result_odds DECIMAL(10, 2),
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'manual'
);

-- 3. Índices para optimizar filtros
CREATE INDEX idx_picks_sport ON picks(sport);
CREATE INDEX idx_picks_status ON picks(status);
CREATE INDEX idx_picks_match_date ON picks(match_date);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

-- 5. Política: Permite que todo el mundo vea los picks (lectura pública)
CREATE POLICY "Lectura pública de picks" ON picks
    FOR SELECT USING (true);

-- 6. Política: Permite gestión completa al rol de servicio (o admin autenticado)
-- Para este despliegue inicial, el API de n8n usará la SERVICE_ROLE_KEY
CREATE POLICY "Gestión total service_role" ON picks
    USING (true)
    WITH CHECK (true);
