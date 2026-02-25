
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
  role TEXT NOT NULL CHECK (role IN ('admin_contratista', 'super_admin', 'super_super_admin')),
  company_id UUID REFERENCES companies(id), -- NULL para Superadmins globales
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MIGRACIÓN DE ROLES (MVP)
-- 1. Cambiar constraint de role
-- ALTER TABLE system_users DROP CONSTRAINT system_users_role_check;
-- ALTER TABLE system_users ADD CONSTRAINT system_users_role_check CHECK (role IN ('admin_contratista', 'super_admin', 'super_super_admin'));

-- 2. Migrar datos existentes
-- UPDATE system_users SET role = 'super_super_admin' WHERE role = 'superadmin';
-- UPDATE system_users SET role = 'admin_contratista' WHERE role = 'user';

-- Actualización de la tabla Trainings existente (si ya existe) para soportar propiedad
ALTER TABLE trainings ADD COLUMN company_id UUID REFERENCES companies(id);

-- Índices para optimizar el filtrado por empresa
CREATE INDEX idx_trainings_company ON trainings(company_id);
CREATE INDEX idx_system_users_company ON system_users(company_id);

-- Actualizaciones para validación de identidad
ALTER TABLE registrations ADD COLUMN identity_validated BOOLEAN DEFAULT FALSE;
ALTER TABLE registrations ADD COLUMN validation_date TIMESTAMP;
ALTER TABLE registrations ADD COLUMN validation_link TEXT UNIQUE;
ALTER TABLE registrations ADD COLUMN validation_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE registrations ADD COLUMN dni_photo_url TEXT;
ALTER TABLE registrations ADD COLUMN selfie_photo_url TEXT;
