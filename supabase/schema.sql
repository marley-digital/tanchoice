-- Tanchoice Meat Factory Database Schema
-- Run this SQL in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  region TEXT,
  default_mark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  region TEXT NOT NULL,
  truck_no TEXT NOT NULL,
  form_no TEXT NOT NULL UNIQUE,
  driver_name TEXT NOT NULL,
  escort_name TEXT NOT NULL,
  prepared_by_name TEXT,
  prepared_by_position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip animals
CREATE TABLE IF NOT EXISTS trip_animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  mark TEXT NOT NULL,
  goats_count INTEGER DEFAULT 0 CHECK (goats_count >= 0),
  sheep_count INTEGER DEFAULT 0 CHECK (sheep_count >= 0),
  total_animals INTEGER DEFAULT 0 CHECK (total_animals >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slaughter results (future use)
CREATE TABLE IF NOT EXISTS slaughter_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  goats_slaughtered INTEGER DEFAULT 0 CHECK (goats_slaughtered >= 0),
  sheep_slaughtered INTEGER DEFAULT 0 CHECK (sheep_slaughtered >= 0),
  meat_kg NUMERIC(10, 2) DEFAULT 0 CHECK (meat_kg >= 0),
  price_per_kg NUMERIC(10, 2) DEFAULT 0 CHECK (price_per_kg >= 0),
  amount_payable NUMERIC(10, 2) DEFAULT 0 CHECK (amount_payable >= 0),
  amount_paid NUMERIC(10, 2) DEFAULT 0 CHECK (amount_paid >= 0),
  payment_date DATE,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_animals_trip_id ON trip_animals(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_animals_supplier_id ON trip_animals(supplier_id);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
CREATE INDEX IF NOT EXISTS idx_trips_region ON trips(region);
CREATE INDEX IF NOT EXISTS idx_slaughter_results_trip_id ON slaughter_results(trip_id);
CREATE INDEX IF NOT EXISTS idx_slaughter_results_supplier_id ON slaughter_results(supplier_id);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE slaughter_results ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY suppliers_select ON suppliers
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY suppliers_insert ON suppliers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY suppliers_update ON suppliers
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY suppliers_delete ON suppliers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Trips policies
CREATE POLICY trips_select ON trips
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY trips_insert ON trips
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY trips_update ON trips
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY trips_delete ON trips
  FOR DELETE USING (auth.role() = 'authenticated');

-- Trip animals policies
CREATE POLICY trip_animals_select ON trip_animals
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY trip_animals_insert ON trip_animals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY trip_animals_update ON trip_animals
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY trip_animals_delete ON trip_animals
  FOR DELETE USING (auth.role() = 'authenticated');

-- Slaughter results policies
CREATE POLICY slaughter_results_select ON slaughter_results
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY slaughter_results_insert ON slaughter_results
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY slaughter_results_update ON slaughter_results
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY slaughter_results_delete ON slaughter_results
  FOR DELETE USING (auth.role() = 'authenticated');

