DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'company_reference'
      AND column_name = 'longtitude'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'company_reference'
      AND column_name = 'longitude'
  ) THEN
    ALTER TABLE company_reference RENAME COLUMN longtitude TO longitude;
  END IF;
END $$;

ALTER TABLE company_reference
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS radius_meters INTEGER NOT NULL DEFAULT 100;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'company_reference'::regclass
      AND conname = 'company_reference_latitude_range'
  ) THEN
    ALTER TABLE company_reference
      ADD CONSTRAINT company_reference_latitude_range
      CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'company_reference'::regclass
      AND conname = 'company_reference_longitude_range'
  ) THEN
    ALTER TABLE company_reference
      ADD CONSTRAINT company_reference_longitude_range
      CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'company_reference'::regclass
      AND conname = 'company_reference_location_pair'
  ) THEN
    ALTER TABLE company_reference
      ADD CONSTRAINT company_reference_location_pair
      CHECK ((latitude IS NULL) = (longitude IS NULL));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'company_reference'::regclass
      AND conname = 'company_reference_radius_positive'
  ) THEN
    ALTER TABLE company_reference
      ADD CONSTRAINT company_reference_radius_positive
      CHECK (radius_meters > 0);
  END IF;
END $$;
