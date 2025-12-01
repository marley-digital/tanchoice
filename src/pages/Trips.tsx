import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { deleteTrip, getTrip, getTrips } from '../lib/api'
import type { Trip, TripWithAnimals } from '../types'

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState<Record<string, { goats: number; sheep: number; total: number }>>({})

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const data = await getTrips()
      setTrips(data)
      const totalsMap: Record<string, { goats: number; sheep: number; total: number }> = {}
      await Promise.all(
        data.map(async (trip) => {
          try {
            const detailed: TripWithAnimals = await getTrip(trip.id)
            totalsMap[trip.id] = {
              goats: detailed.animals.reduce((sum, row) => sum + row.goats_count, 0),
              sheep: detailed.animals.reduce((sum, row) => sum + row.sheep_count, 0),
              total: detailed.animals.reduce((sum, row) => sum + row.total_animals, 0),
            }
          } catch (error) {
            totalsMap[trip.id] = { goats: 0, sheep: 0, total: 0 }
          }
        }),
      )
      setTotals(totalsMap)
    } catch (error: any) {
      alert('Error loading trips: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trip?')) return
    try {
      await deleteTrip(id)
      loadTrips()
    } catch (error: any) {
      alert('Error deleting trip: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase text-slate-500 tracking-wide">Daily Collection Forms</p>
            <h1 className="text-3xl font-bold text-slate-900">Trips</h1>
          </div>
          <Link
            to="/trips/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            New Trip
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-600">Loading trips...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Truck No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Form No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Driver</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Totals</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {new Date(trip.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{trip.region}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{trip.truck_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{trip.form_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{trip.driver_name}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-900">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-xs text-slate-500">Goats</p>
                          <p className="font-semibold">{totals[trip.id]?.goats ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Sheep</p>
                          <p className="font-semibold">{totals[trip.id]?.sheep ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="font-semibold">{totals[trip.id]?.total ?? 0}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <Link className="text-blue-600 hover:text-blue-900" to={`/trips/${trip.id}`}>
                        View
                      </Link>
                      <Link className="text-blue-600 hover:text-blue-900" to={`/trips/${trip.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!trips.length && (
              <div className="text-center py-12 text-slate-500">No trips yet. Create a new trip to begin.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

