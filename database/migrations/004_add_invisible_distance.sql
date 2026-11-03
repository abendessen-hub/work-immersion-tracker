ALTER TABLE attendance_record 
  ADD COLUMN IF NOT EXISTS distance INTEGER NOT NULL DEFAULT 20;

ALTER TABLE company_reference
  REMOVE COLUMN IF EXISTS radius_meters;