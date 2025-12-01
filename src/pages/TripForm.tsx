import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createTrip, getSuppliers, getTrip, updateTrip } from '../lib/api'
import type { Supplier, TripAnimal } from '../types'

interface AnimalRow {
  id: string
  supplier_id: string
  mark: string
  goats_count: number
  sheep_count: number
}

const emptyRow = (): AnimalRow => ({
  id: `row-${Math.random().toString(36).slice(2, 9)}`,
  supplier_id: '',
  mark: '',
  goats_count: 0,
  sheep_count: 0,
})

export default function TripForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    region: '',
    truck_no: '',
    form_no: '',
    driver_name: '',
    escort_name: '',
    prepared_by_name: '',
    prepared_by_position: '',
  })
  const [rows, setRows] = useState<AnimalRow[]>([emptyRow()])

  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      try {
        const supplierData = await getSuppliers()
        setSuppliers(supplierData)
        if (isEditing && id) {
          await loadTrip(id)
        } else {
          generateFormNo()
        }
      } catch (error: any) {
        alert('Error loading trip form: ' + error.message)
        navigate('/trips')
      } finally {
        setLoading(false)
      }
    }
    initialize()
  }, [id])

  const generateFormNo = () => {
    const date = new Date()
    const form = `FORM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
      date.getDate(),
    ).padStart(2, '0')}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`
    setFormData((prev) => ({ ...prev, form_no: form }))
  }

  const loadTrip = async (tripId: string) => {
    const trip = await getTrip(tripId)
    setFormData({
      date: trip.date,
      region: trip.region,
      truck_no: trip.truck_no,
      form_no: trip.form_no,
      driver_name: trip.driver_name,
      escort_name: trip.escort_name,
      prepared_by_name: trip.prepared_by_name || '',
      prepared_by_position: trip.prepared_by_position || '',
    })
    setRows(
      trip.animals.map((animal) => ({
        id: animal.id,
        supplier_id: animal.supplier_id,
        mark: animal.mark,
        goats_count: animal.goats_count,
        sheep_count: animal.sheep_count,
      })),
    )
  }

  const handleRowChange = (index: number, field: keyof AnimalRow, value: string | number) => {
    const updated = [...rows]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'supplier_id') {
      const supplier = suppliers.find((s) => s.id === value)
      if (supplier?.default_mark) {
        updated[index].mark = supplier.default_mark
      }
    }
    setRows(updated)
  }

  const addRow = () => setRows([...rows, emptyRow()])

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const totals = rows.reduce(
    (acc, row) => {
      acc.goats += row.goats_count
      acc.sheep += row.sheep_count
      acc.total += row.goats_count + row.sheep_count
      return acc
    },
    { goats: 0, sheep: 0, total: 0 },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rows.length) {
      alert('Please add at least one supplier line item.')
      return
    }
    for (const row of rows) {
      if (!row.supplier_id) {
        alert('Each row must have a supplier selected.')
        return
      }
      if (row.goats_count < 0 || row.sheep_count < 0) {
        alert('Counts must be zero or greater.')
        return
      }
    }
    try {
      setSaving(true)
      const payload: Omit<TripAnimal, 'id' | 'trip_id' | 'created_at'>[] = rows.map((row) => ({
        supplier_id: row.supplier_id,
        mark: row.mark,
        goats_count: row.goats_count,
        sheep_count: row.sheep_count,
        total_animals: row.goats_count + row.sheep_count,
      }))

      if (isEditing && id) {
        await updateTrip(id, formData, payload)
      } else {
        await createTrip(formData, payload)
      }
      navigate('/trips')
    } catch (error: any) {
      alert('Error saving trip: ' + error.message)
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase text-slate-500 tracking-wide">Daily Trip Form</p>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? 'Edit Trip' : 'New Trip'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Region *</label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Truck No *</label>
              <input
                type="text"
                required
                value={formData.truck_no}
                onChange={(e) => setFormData({ ...formData, truck_no: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Form No *</label>
              <input
                type="text"
                required
                value={formData.form_no}
                onChange={(e) => setFormData({ ...formData, form_no: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name *</label>
              <input
                type="text"
                required
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escort Name *</label>
              <input
                type="text"
                required
                value={formData.escort_name}
                onChange={(e) => setFormData({ ...formData, escort_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prepared By Name</label>
              <input
                type="text"
                value={formData.prepared_by_name}
                onChange={(e) => setFormData({ ...formData, prepared_by_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prepared By Position</label>
              <input
                type="text"
                value={formData.prepared_by_position}
                onChange={(e) => setFormData({ ...formData, prepared_by_position: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Suppliers & Animals</h2>
              <button
                type="button"
                onClick={addRow}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">S/N</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Mark
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Goats</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sheep</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 text-sm text-slate-700">{index + 1}</td>
                      <td className="px-4 py-3">
                        <select
                          required
                          value={row.supplier_id}
                          onChange={(e) => handleRowChange(index, 'supplier_id', e.target.value)}
                          className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">Select supplier</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          required
                          value={row.mark}
                          onChange={(e) => handleRowChange(index, 'mark', e.target.value)}
                          className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={row.goats_count}
                          onChange={(e) => handleRowChange(index, 'goats_count', Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={row.sheep_count}
                          onChange={(e) => handleRowChange(index, 'sheep_count', Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {row.goats_count + row.sheep_count}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold" colSpan={3}>
                      Totals
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{totals.goats}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{totals.sheep}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{totals.total}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

