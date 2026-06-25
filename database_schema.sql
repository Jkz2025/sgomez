-- Script SQL para crear todas las tablas de la aplicación Royal Prestige Cali
-- Base de datos: PostgreSQL (Supabase)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: profiles
-- Almacena la información de perfiles de usuarios del sistema
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cargo TEXT NOT NULL CHECK (cargo IN ('asesor', 'televentas', 'distribuidor')),
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    codigo TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    distribuidor TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_cargo ON profiles(cargo);
CREATE INDEX IF NOT EXISTS idx_profiles_distribuidor ON profiles(distribuidor);
CREATE INDEX IF NOT EXISTS idx_profiles_correo ON profiles(correo);

-- Trigger para actualizar updated_at en profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: programas
-- Almacena los programas creados por los asesores
CREATE TABLE IF NOT EXISTS programas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asesor UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    fecha_inicial TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_final TIMESTAMP WITH TIME ZONE NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    cliente_direccion TEXT NOT NULL,
    regalo TEXT NOT NULL,
    distribucion TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para programas
CREATE INDEX IF NOT EXISTS idx_programas_asesor ON programas(asesor);
CREATE INDEX IF NOT EXISTS idx_programas_fecha_inicial ON programas(fecha_inicial);
CREATE INDEX IF NOT EXISTS idx_programas_fecha_final ON programas(fecha_final);
CREATE INDEX IF NOT EXISTS idx_programas_created_at ON programas(created_at);

-- Trigger para actualizar updated_at en programas
CREATE TRIGGER update_programas_updated_at BEFORE UPDATE ON programas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: referidos_programa
-- Almacena los referidos asociados a cada programa
CREATE TABLE IF NOT EXISTS referidos_programa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programa UUID NOT NULL REFERENCES programas(id) ON DELETE CASCADE,
    programa_id UUID NOT NULL, -- Campo adicional para compatibilidad con código existente
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    correo TEXT,
    estado_civil TEXT,
    trabajo TEXT,
    barrio_ciudad TEXT,
    razon_recomendacion TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'contactado', 'convertido', 'perdido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para referidos_programa
CREATE INDEX IF NOT EXISTS idx_referidos_programa_programa ON referidos_programa(programa);
CREATE INDEX IF NOT EXISTS idx_referidos_programa_programa_id ON referidos_programa(programa_id);
CREATE INDEX IF NOT EXISTS idx_referidos_programa_estado ON referidos_programa(estado);
CREATE INDEX IF NOT EXISTS idx_referidos_programa_created_at ON referidos_programa(created_at);

-- Trigger para actualizar updated_at en referidos_programa
CREATE TRIGGER update_referidos_programa_updated_at BEFORE UPDATE ON referidos_programa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: visitas
-- Almacena las visitas programadas y realizadas
CREATE TABLE IF NOT EXISTS visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asesor UUID REFERENCES profiles(id) ON DELETE SET NULL,
    televentas_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_direccion TEXT,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    hora TIME,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'reprogramada', 'cancelada', 'reprogramar')),
    resultado TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para visitas
CREATE INDEX IF NOT EXISTS idx_visitas_asesor ON visitas(asesor);
CREATE INDEX IF NOT EXISTS idx_visitas_televentas_id ON visitas(televentas_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_estado ON visitas(estado);
CREATE INDEX IF NOT EXISTS idx_visitas_created_at ON visitas(created_at);

-- Trigger para actualizar updated_at en visitas
CREATE TRIGGER update_visitas_updated_at BEFORE UPDATE ON visitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: notas
-- Almacena las notas y recordatorios de los usuarios
CREATE TABLE IF NOT EXISTS notas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    categoria TEXT DEFAULT 'general' CHECK (categoria IN ('general', 'cita', 'cliente', 'programa', 'recordatorio')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para notas
CREATE INDEX IF NOT EXISTS idx_notas_usuario_id ON notas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notas_categoria ON notas(categoria);
CREATE INDEX IF NOT EXISTS idx_notas_created_at ON notas(created_at);

-- Trigger para actualizar updated_at en notas
CREATE TRIGGER update_notas_updated_at BEFORE UPDATE ON notas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: clientes
-- Almacena la información de clientes potenciales
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asesor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    direccion TEXT,
    ciudad TEXT,
    barrio TEXT,
    correo TEXT,
    trabajo TEXT,
    fecha_nacimiento DATE,
    notas TEXT,
    estado TEXT DEFAULT 'potencial' CHECK (estado IN ('potencial', 'contactado', 'interesado', 'cliente', 'perdido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_asesor_id ON clientes(asesor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_ciudad ON clientes(ciudad);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON clientes(created_at);

-- Trigger para actualizar updated_at en clientes
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad (Row Level Security) para Supabase
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE referidos_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para programas
CREATE POLICY "Users can view own programs" ON programas
    FOR SELECT USING (auth.uid() = asesor);

CREATE POLICY "Users can create programs" ON programas
    FOR INSERT WITH CHECK (auth.uid() = asesor);

CREATE POLICY "Users can update own programs" ON programas
    FOR UPDATE USING (auth.uid() = asesor);

CREATE POLICY "Users can delete own programs" ON programas
    FOR DELETE USING (auth.uid() = asesor);

-- Políticas para referidos_programa
CREATE POLICY "Users can view referidos of own programs" ON referidos_programa
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

CREATE POLICY "Users can create referidos for own programs" ON referidos_programa
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

CREATE POLICY "Users can update referidos of own programs" ON referidos_programa
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

CREATE POLICY "Users can delete referidos of own programs" ON referidos_programa
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

-- Políticas para visitas
CREATE POLICY "Users can view own visits" ON visitas
    FOR SELECT USING (auth.uid() = asesor OR auth.uid() = televentas_id);

CREATE POLICY "Users can create visits" ON visitas
    FOR INSERT WITH CHECK (auth.uid() = asesor OR auth.uid() = televentas_id);

CREATE POLICY "Users can update own visits" ON visitas
    FOR UPDATE USING (auth.uid() = asesor OR auth.uid() = televentas_id);

CREATE POLICY "Users can delete own visits" ON visitas
    FOR DELETE USING (auth.uid() = asesor OR auth.uid() = televentas_id);

-- Políticas para notas
CREATE POLICY "Users can view own notes" ON notas
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create notes" ON notas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own notes" ON notas
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own notes" ON notas
    FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para clientes
CREATE POLICY "Users can view own clients" ON clientes
    FOR SELECT USING (auth.uid() = asesor_id);

CREATE POLICY "Users can create clients" ON clientes
    FOR INSERT WITH CHECK (auth.uid() = asesor_id);

CREATE POLICY "Users can update own clients" ON clientes
    FOR UPDATE USING (auth.uid() = asesor_id);

CREATE POLICY "Users can delete own clients" ON clientes
    FOR DELETE USING (auth.uid() = asesor_id);

-- Comentarios para documentación
COMMENT ON TABLE profiles IS 'Tabla de perfiles de usuarios del sistema';
COMMENT ON TABLE programas IS 'Tabla de programas creados por asesores';
COMMENT ON TABLE referidos_programa IS 'Tabla de referidos asociados a programas';
COMMENT ON TABLE visitas IS 'Tabla de visitas programadas y realizadas';
COMMENT ON TABLE notas IS 'Tabla de notas y recordatorios de usuarios';
COMMENT ON TABLE clientes IS 'Tabla de clientes potenciales';

COMMENT ON COLUMN profiles.id IS 'ID del usuario (referencia a auth.users)';
COMMENT ON COLUMN profiles.cargo IS 'Cargo del usuario: asesor, televentas o distribuidor';
COMMENT ON COLUMN profiles.distribuidor IS 'Nombre del distribuidor al que pertenece';
COMMENT ON COLUMN profiles.avatar_url IS 'URL de la imagen de perfil';

COMMENT ON COLUMN programas.asesor IS 'ID del asesor que creó el programa';
COMMENT ON COLUMN programas.fecha_inicial IS 'Fecha de inicio del programa';
COMMENT ON COLUMN programas.fecha_final IS 'Fecha de finalización del programa';
COMMENT ON COLUMN programas.cliente_nombre IS 'Nombre del cliente principal del programa';
COMMENT ON COLUMN programas.cliente_telefono IS 'Teléfono del cliente principal';
COMMENT ON COLUMN programas.cliente_direccion IS 'Dirección del cliente principal';
COMMENT ON COLUMN programas.regalo IS 'Regalo asociado al programa';
COMMENT ON COLUMN programas.distribucion IS 'Información de distribución del programa';

COMMENT ON COLUMN referidos_programa.programa IS 'ID del programa al que pertenece el referido';
COMMENT ON COLUMN referidos_programa.programa_id IS 'ID del programa (campo adicional para compatibilidad)';
COMMENT ON COLUMN referidos_programa.estado IS 'Estado del referido: pendiente, contactado, convertido o perdido';
COMMENT ON COLUMN referidos_programa.estado_civil IS 'Estado civil del referido';
COMMENT ON COLUMN referidos_programa.trabajo IS 'Trabajo del referido';
COMMENT ON COLUMN referidos_programa.barrio_ciudad IS 'Barrio o ciudad del referido';
COMMENT ON COLUMN referidos_programa.razon_recomendacion IS 'Razón por la que fue recomendado';

COMMENT ON COLUMN visitas.asesor IS 'ID del asesor asignado a la visita';
COMMENT ON COLUMN visitas.televentas_id IS 'ID del usuario de televentas que creó la visita';
COMMENT ON COLUMN visitas.estado IS 'Estado de la visita: pendiente, completada, reprogramada, cancelada o reprogramar';
COMMENT ON COLUMN visitas.resultado IS 'Resultado de la visita';

COMMENT ON COLUMN notas.usuario_id IS 'ID del usuario que creó la nota';
COMMENT ON COLUMN notas.titulo IS 'Título de la nota';
COMMENT ON COLUMN notas.contenido IS 'Contenido de la nota';
COMMENT ON COLUMN notas.categoria IS 'Categoría de la nota: general, cita, cliente, programa o recordatorio';

COMMENT ON COLUMN clientes.asesor_id IS 'ID del asesor que agregó el cliente';
COMMENT ON COLUMN clientes.nombre_completo IS 'Nombre completo del cliente';
COMMENT ON COLUMN clientes.telefono IS 'Teléfono del cliente';
COMMENT ON COLUMN clientes.direccion IS 'Dirección del cliente';
COMMENT ON COLUMN clientes.estado IS 'Estado del cliente: potencial, contactado, interesado, cliente o perdido';
