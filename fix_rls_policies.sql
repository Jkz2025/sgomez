-- ============================================
-- SCRIPT PARA CORREGIR POLÍTICAS RLS DE SUPABASE
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================

-- Eliminar políticas existentes que causan recursión infinita
DROP POLICY IF EXISTS "Distribuidores can view profiles of their team" ON profiles;
DROP POLICY IF EXISTS "Distribuidores can view team visits" ON visitas;
DROP POLICY IF EXISTS "Distribuidores can view team clients" ON clientes;

-- Políticas simplificadas para profiles (sin recursión)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para programas
DROP POLICY IF EXISTS "Users can view own programs" ON programas;
CREATE POLICY "Users can view own programs" ON programas
    FOR SELECT USING (auth.uid() = asesor);

DROP POLICY IF EXISTS "Users can create programs" ON programas;
CREATE POLICY "Users can create programs" ON programas
    FOR INSERT WITH CHECK (auth.uid() = asesor);

DROP POLICY IF EXISTS "Users can update own programs" ON programas;
CREATE POLICY "Users can update own programs" ON programas
    FOR UPDATE USING (auth.uid() = asesor);

DROP POLICY IF EXISTS "Users can delete own programs" ON programas;
CREATE POLICY "Users can delete own programs" ON programas
    FOR DELETE USING (auth.uid() = asesor);

-- Políticas para referidos_programa
DROP POLICY IF EXISTS "Users can view referidos of own programs" ON referidos_programa;
CREATE POLICY "Users can view referidos of own programs" ON referidos_programa
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create referidos for own programs" ON referidos_programa;
CREATE POLICY "Users can create referidos for own programs" ON referidos_programa
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update referidos of own programs" ON referidos_programa;
CREATE POLICY "Users can update referidos of own programs" ON referidos_programa
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete referidos of own programs" ON referidos_programa;
CREATE POLICY "Users can delete referidos of own programs" ON referidos_programa
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM programas p
            WHERE p.id = referidos_programa.programa
            AND p.asesor = auth.uid()
        )
    );

-- Políticas para visitas
DROP POLICY IF EXISTS "Users can view own visits" ON visitas;
CREATE POLICY "Users can view own visits" ON visitas
    FOR SELECT USING (auth.uid() = asesor OR auth.uid() = televentas_id);

DROP POLICY IF EXISTS "Users can create visits" ON visitas;
CREATE POLICY "Users can create visits" ON visitas
    FOR INSERT WITH CHECK (auth.uid() = asesor OR auth.uid() = televentas_id);

DROP POLICY IF EXISTS "Users can update own visits" ON visitas;
CREATE POLICY "Users can update own visits" ON visitas
    FOR UPDATE USING (auth.uid() = asesor OR auth.uid() = televentas_id);

DROP POLICY IF EXISTS "Users can delete own visits" ON visitas;
CREATE POLICY "Users can delete own visits" ON visitas
    FOR DELETE USING (auth.uid() = asesor OR auth.uid() = televentas_id);

-- Políticas para notas
DROP POLICY IF EXISTS "Users can view own notes" ON notas;
CREATE POLICY "Users can view own notes" ON notas
    FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can create notes" ON notas;
CREATE POLICY "Users can create notes" ON notas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notas;
CREATE POLICY "Users can update own notes" ON notas
    FOR UPDATE USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notas;
CREATE POLICY "Users can delete own notes" ON notas
    FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para clientes
DROP POLICY IF EXISTS "Users can view own clients" ON clientes;
CREATE POLICY "Users can view own clients" ON clientes
    FOR SELECT USING (auth.uid() = asesor_id);

DROP POLICY IF EXISTS "Users can create clients" ON clientes;
CREATE POLICY "Users can create clients" ON clientes
    FOR INSERT WITH CHECK (auth.uid() = asesor_id);

DROP POLICY IF EXISTS "Users can update own clients" ON clientes;
CREATE POLICY "Users can update own clients" ON clientes
    FOR UPDATE USING (auth.uid() = asesor_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON clientes;
CREATE POLICY "Users can delete own clients" ON clientes
    FOR DELETE USING (auth.uid() = asesor_id);

-- ============================================
-- INSTRUCCIONES:
-- 1. Copia todo este script
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el script y ejecútalo
-- 4. Esto corregirá las políticas RLS eliminando las que causan recursión
-- ============================================
