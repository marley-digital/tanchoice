import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { deleteTrip, getTrip } from '../lib/api'
import type { TripWithAnimals } from '../types'
import { generateTripPDF } from '../lib/pdf'

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<TripWithAnimals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadTrip(id)
    }
  }, [id])

  const loadTrip = async (tripId: string) => {
    try {
      setLoading(true)
      const data = await getTrip(tripId)
      setTrip(data)
    } catch (error: any) {
      alert('Error loading trip: ' + error.message)
      navigate('/trips')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this trip?')) return
    try {
      await deleteTrip(id)
      navigate('/trips')
    } catch (error: any) {
      alert('Error deleting trip: ' + error.message)
    }
  }

  const handleDownloadPDF = () => {
    if (!trip) return
    const doc = generateTripPDF(trip)
    doc.save(`Trip-${trip.form_no}.pdf`)
  }

  const handlePrint = () => {
    if (!trip) return
    const doc = generateTripPDF(trip)
    doc.autoPrint()
    doc.output('dataurlnewwindow')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-600">Loading trip...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-slate-600">Trip not found.</p>
        </div>
      </div>
    )
  }

  const totalGoats = trip.animals.reduce((sum, row) => sum + row.goats_count, 0)
  const totalSheep = trip.animals.reduce((sum, row) => sum + row.sheep_count, 0)
  const totalAnimals = trip.animals.reduce((sum, row) => sum + row.total_animals, 0)

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase text-slate-500 tracking-wide">Trip Detail</p>
            <h1 className="text-3xl font-bold text-slate-900">Form {trip.form_no}</h1>
            <p className="text-slate-500">Date: {new Date(trip.date).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Print
            </button>
            <Link
              to={`/trips/${trip.id}/edit`}
              className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900"
            >
              Edit
            </Link>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Region</p>
              <p className="text-lg font-semibold text-slate-900">{trip.region}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Truck No</p>
              <p className="text-lg font-semibold text-slate-900">{trip.truck_no}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Driver</p>
              <p className="text-lg font-semibold text-slate-900">{trip.driver_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Escort</p>
              <p className="text-lg font-semibold text-slate-900">{trip.escort_name}</p>
            </div>
            {trip.prepared_by_name && (
              <div>
                <p className="text-sm text-slate-500">Prepared By</p>
                <p className="text-lg font-semibold text-slate-900">
                  {trip.prepared_by_position} {trip.prepared_by_name}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Suppliers & Animals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">S/N</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Mark
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Goats
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Sheep
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {trip.animals.map((animal, index) => (
                  <tr key={animal.id}>
                    <td className="px-4 py-3 text-sm text-slate-700">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{animal.supplier?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{animal.mark}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{animal.goats_count}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{animal.sheep_count}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{animal.total_animals}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold" colSpan={3}>
                    Totals
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{totalGoats}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{totalSheep}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{totalAnimals}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

