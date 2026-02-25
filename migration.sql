-- Add status columns to trainings table
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
  CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS suspended_by TEXT REFERENCES users(id);
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS deactivated_by TEXT REFERENCES users(id);
