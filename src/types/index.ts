export interface Supplier {
  id: string
  name: string
  phone?: string | null
  region?: string | null
  default_mark?: string | null
  created_at: string
}

export interface Trip {
  id: string
  date: string
  region: string
  truck_no: string
  form_no: string
  driver_name: string
  escort_name: string
  prepared_by_name?: string | null
  prepared_by_position?: string | null
  created_at: string
}

export interface TripAnimal {
  id: string
  trip_id: string
  supplier_id: string
  mark: string
  goats_count: number
  sheep_count: number
  total_animals: number
  created_at: string
}

export interface TripWithAnimals extends Trip {
  animals: (TripAnimal & { supplier?: Supplier | null })[]
}

export interface SlaughterResult {
  id: string
  trip_id: string
  supplier_id: string
  goats_slaughtered: number
  sheep_slaughtered: number
  meat_kg: number
  price_per_kg: number
  amount_payable: number
  amount_paid: number
  payment_date?: string | null
  payment_reference?: string | null
  created_at: string
}

