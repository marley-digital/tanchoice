import { supabase, isMockedSupabase } from './supabaseClient'
import type { Supplier, Trip, TripAnimal, TripWithAnimals } from '../types'

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`
}

const mockCreatedAt = () => new Date().toISOString()

const MOCK_DB_KEY = 'tanchoice_mock_db'

type MockDb = {
  suppliers: Supplier[]
  trips: Trip[]
  tripAnimals: TripAnimal[]
}

const getDefaultMockDb = (): MockDb => ({
  suppliers: [
    {
      id: generateId(),
      name: 'Mwanga Livestock Traders',
      phone: '+255 712 555 111',
      region: 'Manyara',
      default_mark: 'M1',
      created_at: mockCreatedAt(),
    },
    {
      id: generateId(),
      name: 'Kilimanjaro Goats',
      phone: '+255 713 222 444',
      region: 'Arusha',
      default_mark: 'KG',
      created_at: mockCreatedAt(),
    },
  ],
  trips: [],
  tripAnimals: [],
})

const loadMockDb = (): MockDb => {
  if (typeof window === 'undefined') {
    return getDefaultMockDb()
  }
  const raw = localStorage.getItem(MOCK_DB_KEY)
  if (!raw) {
    return getDefaultMockDb()
  }
  try {
    const parsed = JSON.parse(raw)
    if (parsed && parsed.suppliers && parsed.trips && parsed.tripAnimals) {
      return parsed
    }
  } catch (error) {
    console.warn('Failed to parse mock DB, resetting...', error)
  }
  return getDefaultMockDb()
}

let mockDb: MockDb = loadMockDb()

const persistMockDb = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(mockDb))
}

// Get current user ID for Supabase operations
const getCurrentUserId = async (): Promise<string | null> => {
  if (isMockedSupabase) {
    return 'mock-user-id'
  }
  const { data: { user } } = await supabase!.auth.getUser()
  return user?.id || null
}

const enrichTrip = (trip: Trip): TripWithAnimals => {
  const animals = mockDb.tripAnimals
    .filter((a) => a.trip_id === trip.id)
    .map((a) => ({
      ...a,
      supplier: mockDb.suppliers.find((s) => s.id === a.supplier_id) || null,
    }))
  return { ...trip, animals }
}

// Suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  if (isMockedSupabase) {
    return [...mockDb.suppliers].sort((a, b) => a.name.localeCompare(b.name))
  }
  const { data, error } = await supabase!
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> => {
  if (isMockedSupabase) {
    const newSupplier: Supplier = {
      id: generateId(),
      created_at: mockCreatedAt(),
      ...supplier,
    }
    mockDb = {
      ...mockDb,
      suppliers: [...mockDb.suppliers, newSupplier],
    }
    persistMockDb()
    return newSupplier
  }
  
  const userId = await getCurrentUserId()
  const supplierWithUser = {
    ...supplier,
    user_id: userId
  }
  
  const { data, error } = await supabase!
    .from('suppliers')
    .insert(supplierWithUser)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
  if (isMockedSupabase) {
    mockDb = {
      ...mockDb,
      suppliers: mockDb.suppliers.map((s) => (s.id === id ? { ...s, ...supplier } : s)),
    }
    persistMockDb()
    const updated = mockDb.suppliers.find((s) => s.id === id)
    if (!updated) throw new Error('Supplier not found')
    return updated
  }
  
  // For Supabase, the RLS policy will prevent updating records owned by other users
  const { data, error } = await supabase!
    .from('suppliers')
    .update(supplier)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteSupplier = async (id: string): Promise<void> => {
  if (isMockedSupabase) {
    mockDb = {
      ...mockDb,
      suppliers: mockDb.suppliers.filter((s) => s.id !== id),
      tripAnimals: mockDb.tripAnimals.filter((a) => a.supplier_id !== id),
    }
    persistMockDb()
    return
  }
  const { error } = await supabase!
    .from('suppliers')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Trips
export const getTrips = async (): Promise<Trip[]> => {
  if (isMockedSupabase) {
    return [...mockDb.trips].sort((a, b) => (a.date < b.date ? 1 : -1))
  }
  const { data, error } = await supabase!
    .from('trips')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export const getTrip = async (id: string): Promise<TripWithAnimals> => {
  if (isMockedSupabase) {
    const trip = mockDb.trips.find((t) => t.id === id)
    if (!trip) throw new Error('Trip not found')
    return enrichTrip(trip)
  }
  const { data: trip, error: tripError } = await supabase!
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (tripError) throw tripError

  const { data: animals, error: animalsError } = await supabase!
    .from('trip_animals')
    .select('*, supplier:suppliers(*)')
    .eq('trip_id', id)
    .order('created_at')

  if (animalsError) throw animalsError

  return {
    ...trip,
    animals: animals || [],
  }
}

export const createTrip = async (
  trip: Omit<Trip, 'id' | 'created_at'>,
  animals: Omit<TripAnimal, 'id' | 'trip_id' | 'created_at'>[],
): Promise<TripWithAnimals> => {
  if (isMockedSupabase) {
    const newTrip: Trip = {
      id: generateId(),
      created_at: mockCreatedAt(),
      ...trip,
    }
    const newTripAnimals: TripAnimal[] = animals.map((animal) => ({
      id: generateId(),
      trip_id: newTrip.id,
      created_at: mockCreatedAt(),
      ...animal,
      total_animals: animal.goats_count + animal.sheep_count,
    }))
    mockDb = {
      ...mockDb,
      trips: [...mockDb.trips, newTrip],
      tripAnimals: [...mockDb.tripAnimals, ...newTripAnimals],
    }
    persistMockDb()
    return enrichTrip(newTrip)
  }
  
  const userId = await getCurrentUserId()
  const tripWithUser = {
    ...trip,
    user_id: userId
  }
  
  const { data: tripData, error: tripError } = await supabase!
    .from('trips')
    .insert(tripWithUser)
    .select()
    .single()

  if (tripError) throw tripError

  const animalsWithTripId = animals.map((animal) => ({
    ...animal,
    trip_id: tripData.id,
    total_animals: animal.goats_count + animal.sheep_count,
    user_id: userId
  }))

  const { data: animalsData, error: animalsError } = await supabase!
    .from('trip_animals')
    .insert(animalsWithTripId)
    .select('*, supplier:suppliers(*)')

  if (animalsError) throw animalsError

  return {
    ...tripData,
    animals: animalsData || [],
  }
}

export const updateTrip = async (
  id: string,
  trip: Partial<Trip>,
  animals: Omit<TripAnimal, 'id' | 'trip_id' | 'created_at'>[],
): Promise<TripWithAnimals> => {
  if (isMockedSupabase) {
    const updatedTripList = mockDb.trips.map((t) => (t.id === id ? { ...t, ...trip } : t))
    const replacementAnimals: TripAnimal[] = animals.map((animal) => ({
      id: generateId(),
      trip_id: id,
      created_at: mockCreatedAt(),
      ...animal,
      total_animals: animal.goats_count + animal.sheep_count,
    }))
    mockDb = {
      ...mockDb,
      trips: updatedTripList,
      tripAnimals: [
        ...mockDb.tripAnimals.filter((a) => a.trip_id !== id),
        ...replacementAnimals,
      ],
    }
    persistMockDb()
    const updatedTrip = mockDb.trips.find((t) => t.id === id)
    if (!updatedTrip) throw new Error('Trip not found')
    return enrichTrip(updatedTrip)
  }
  
  const userId = await getCurrentUserId()
  
  // For Supabase, the RLS policy will prevent updating records owned by other users
  const { data: tripData, error: tripError } = await supabase!
    .from('trips')
    .update(trip)
    .eq('id', id)
    .select()
    .single()

  if (tripError) throw tripError

  const { error: deleteError } = await supabase!
    .from('trip_animals')
    .delete()
    .eq('trip_id', id)

  if (deleteError) throw deleteError

  const animalsWithTripId = animals.map((animal) => ({
    ...animal,
    trip_id: id,
    total_animals: animal.goats_count + animal.sheep_count,
    user_id: userId
  }))

  const { data: animalsData, error: animalsError } = await supabase!
    .from('trip_animals')
    .insert(animalsWithTripId)
    .select('*, supplier:suppliers(*)')

  if (animalsError) throw animalsError

  return {
    ...tripData,
    animals: animalsData || [],
  }
}

export const deleteTrip = async (id: string): Promise<void> => {
  if (isMockedSupabase) {
    mockDb = {
      ...mockDb,
      trips: mockDb.trips.filter((t) => t.id !== id),
      tripAnimals: mockDb.tripAnimals.filter((a) => a.trip_id !== id),
    }
    persistMockDb()
    return
  }
  const { error } = await supabase!
    .from('trips')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Reports
export const getSupplierReport = async (
  fromDate: string,
  toDate: string,
  region?: string,
) => {
  if (isMockedSupabase) {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    return mockDb.tripAnimals
      .map((animal) => {
        const trip = mockDb.trips.find((t) => t.id === animal.trip_id)
        const supplier = mockDb.suppliers.find((s) => s.id === animal.supplier_id)
        if (!trip) return null
        const tripDate = new Date(trip.date)
        if (tripDate < from || tripDate > to) return null
        if (region && trip.region !== region) return null
        return {
          ...animal,
          supplier_id: animal.supplier_id,
          supplier: supplier ? { name: supplier.name } : null,
          trip: {
            date: trip.date,
            region: trip.region,
            truck_no: trip.truck_no,
            form_no: trip.form_no,
          },
        }
      })
      .filter(Boolean)
  }

  let query = supabase!
    .from('trip_animals')
    .select(`
      supplier_id,
      goats_count,
      sheep_count,
      total_animals,
      supplier:suppliers(name),
      trip:trips(date, region, truck_no, form_no)
    `)
    .gte('trip.date', fromDate)
    .lte('trip.date', toDate)

  if (region) {
    query = query.eq('trip.region', region)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export const getSupplierDetailReport = async (
  supplierId: string,
  fromDate: string,
  toDate: string,
) => {
  if (isMockedSupabase) {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    return mockDb.tripAnimals
      .filter((item) => item.supplier_id === supplierId)
      .map((item) => {
        const trip = mockDb.trips.find((t) => t.id === item.trip_id)
        if (!trip) return null
        const tripDate = new Date(trip.date)
        if (tripDate < from || tripDate > to) return null
        return {
          goats_count: item.goats_count,
          sheep_count: item.sheep_count,
          total_animals: item.total_animals,
          trip: {
            date: trip.date,
            region: trip.region,
            truck_no: trip.truck_no,
            form_no: trip.form_no,
          },
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.trip.date < b.trip.date ? 1 : -1))
  }

  const { data, error } = await supabase!
    .from('trip_animals')
    .select(`
      goats_count,
      sheep_count,
      total_animals,
      trip:trips(date, region, truck_no, form_no)
    `)
    .eq('supplier_id', supplierId)
    .gte('trip.date', fromDate)
    .lte('trip.date', toDate)
    .order('trip.date', { ascending: false })

  if (error) throw error
  return data || []
}

