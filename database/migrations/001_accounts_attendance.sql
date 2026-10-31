CREATE TABLE IF NOT EXISTS access_reference (
  access_id SERIAL PRIMARY KEY,
  access_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS company_reference (
  company_id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  CONSTRAINT company_reference_latitude_range
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT company_reference_longitude_range
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  CONSTRAINT company_reference_location_pair
    CHECK ((latitude IS NULL) = (longitude IS NULL)),
  CONSTRAINT company_reference_radius_positive
    CHECK (radius_meters > 0)
);

CREATE TABLE IF NOT EXISTS immersion_teacher (
  teacher_id SERIAL PRIMARY KEY,
  teacher_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS section_reference (
  section_id SERIAL PRIMARY KEY,
  section_name TEXT NOT NULL,
  teacher_id INTEGER REFERENCES immersion_teacher(teacher_id),
  company_id INTEGER REFERENCES company_reference(company_id)
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  "changedPassword" BOOLEAN,
  section_id INTEGER REFERENCES section_reference(section_id),
  company_id INTEGER REFERENCES company_reference(company_id),
  contact_number TEXT,
  access_id INTEGER NOT NULL REFERENCES access_reference(access_id)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
UPDATE users
SET full_name = username
WHERE full_name IS NULL OR BTRIM(full_name) = '';
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

CREATE TABLE IF NOT EXISTS attendance_record (
  record_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  date DATE NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_date
  ON attendance_record(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date
  ON attendance_record(date);
CREATE INDEX IF NOT EXISTS idx_users_section
  ON users(section_id);

INSERT INTO access_reference (access_name)
SELECT role.access_name
FROM (VALUES ('student'), ('teacher'), ('admin')) AS role(access_name)
WHERE NOT EXISTS (
  SELECT 1
  FROM access_reference existing
  WHERE lower(existing.access_name) = role.access_name
);
