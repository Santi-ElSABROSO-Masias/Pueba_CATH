
-- Tabla de Empresas (Tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Usuarios del Sistema (Administradores y Operadores)
CREATE TABLE system_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'user')),
  company_id UUID REFERENCES companies(id), -- NULL para Superadmins globales
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actualización de la tabla Trainings existente (si ya existe) para soportar propiedad
ALTER TABLE trainings ADD COLUMN company_id UUID REFERENCES companies(id);

-- Índices para optimizar el filtrado por empresa
CREATE INDEX idx_trainings_company ON trainings(company_id);
CREATE INDEX idx_system_users_company ON system_users(company_id);
