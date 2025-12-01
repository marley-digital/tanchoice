-- Fix Authentication Issues - Add User Ownership
-- Run this SQL in Supabase SQL Editor after the initial schema

-- Add user_id column to tables
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE trip_animals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE slaughter_results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_animals_user_id ON trip_animals(user_id);
CREATE INDEX IF NOT EXISTS idx_slaughter_results_user_id ON slaughter_results(user_id);

-- Update existing RLS policies to restrict by user ownership
DROP POLICY IF EXISTS suppliers_select ON suppliers;
DROP POLICY IF EXISTS suppliers_insert ON suppliers;
DROP POLICY IF EXISTS suppliers_update ON suppliers;
DROP POLICY IF EXISTS suppliers_delete ON suppliers;

CREATE POLICY suppliers_select ON suppliers
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY suppliers_insert ON suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY suppliers_update ON suppliers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY suppliers_delete ON suppliers
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS trips_select ON trips;
DROP POLICY IF EXISTS trips_insert ON trips;
DROP POLICY IF EXISTS trips_update ON trips;
DROP POLICY IF EXISTS trips_delete ON trips;

CREATE POLICY trips_select ON trips
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY trips_insert ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY trips_update ON trips
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY trips_delete ON trips
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS trip_animals_select ON trip_animals;
DROP POLICY IF EXISTS trip_animals_insert ON trip_animals;
DROP POLICY IF EXISTS trip_animals_update ON trip_animals;
DROP POLICY IF EXISTS trip_animals_delete ON trip_animals;

CREATE POLICY trip_animals_select ON trip_animals
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY trip_animals_insert ON trip_animals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY trip_animals_update ON trip_animals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY trip_animals_delete ON trip_animals
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS slaughter_results_select ON slaughter_results;
DROP POLICY IF EXISTS slaughter_results_insert ON slaughter_results;
DROP POLICY IF EXISTS slaughter_results_update ON slaughter_results;
DROP POLICY IF EXISTS slaughter_results_delete ON slaughter_results;

CREATE POLICY slaughter_results_select ON slaughter_results
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY slaughter_results_insert ON slaughter_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY slaughter_results_update ON slaughter_results
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY slaughter_results_delete ON slaughter_results
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically set user_id
DROP TRIGGER IF EXISTS set_suppliers_user_id ON suppliers;
CREATE TRIGGER set_suppliers_user_id
  BEFORE INSERT ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_trips_user_id ON trips;
CREATE TRIGGER set_trips_user_id
  BEFORE INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_trip_animals_user_id ON trip_animals;
CREATE TRIGGER set_trip_animals_user_id
  BEFORE INSERT ON trip_animals
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_slaughter_results_user_id ON slaughter_results;
CREATE TRIGGER set_slaughter_results_user_id
  BEFORE INSERT ON slaughter_results
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();