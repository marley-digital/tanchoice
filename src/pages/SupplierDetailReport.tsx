import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getSupplierDetailReport, getSuppliers } from '../lib/api'
import { downloadCSV, generateCSV } from '../lib/csv'
import { generateSupplierReportPDF } from '../lib/pdf'

export default function SupplierDetailReport() {
  const { supplierId } = useParams()
  const navigate = useNavigate()
  const [supplierName, setSupplierName] = useState('')
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (supplierId) {
      loadData()
    }
  }, [supplierId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [suppliers, report] = await Promise.all([
        getSuppliers(),
        getSupplierDetailReport(supplierId!, filters.fromDate, filters.toDate),
      ])
      const supplier = suppliers.find((s) => s.id === supplierId)
      setSupplierName(supplier?.name || 'Unknown Supplier')
      setReportData(report)
    } catch (error: any) {
      alert('Error loading report: ' + error.message)
      navigate('/reports/suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = () => {
    loadData()
  }

  const handleExportCSV = () => {
    const csvData = reportData.map((item) => ({
      date: new Date(item.trip.date).toLocaleDateString(),
      region: item.trip.region || '',
      truck_no: item.trip.truck_no || '',
      form_no: item.trip.form_no || '',
      goats: item.goats_count,
      sheep: item.sheep_count,
      total_animals: item.total_animals,
    }))
    const csv = generateCSV(csvData, ['Date', 'Region', 'Truck No', 'Form No', 'Goats', 'Sheep', 'Total Animals'])
    downloadCSV(csv, `supplier-${supplierName}-${filters.fromDate}-${filters.toDate}.csv`)
  }

  const handleDownloadPDF = () => {
    const doc = generateSupplierReportPDF(supplierName, reportData, filters.fromDate, filters.toDate)
    doc.save(`supplier-${supplierName}-${filters.fromDate}-${filters.toDate}.pdf`)
  }

  const totals = reportData.reduce(
    (acc, row) => {
      acc.goats += row.goats_count
      acc.sheep += row.sheep_count
      acc.total += row.total_animals
      return acc
    },
    { goats: 0, sheep: 0, total: 0 },
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-600">Loading report...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <button onClick={() => navigate('/reports/suppliers')} className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Reports
            </button>
            <p className="text-sm uppercase text-slate-500 tracking-wide mt-2">Supplier Detail</p>
            <h1 className="text-3xl font-bold text-slate-900">{supplierName}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
              Export CSV
            </button>
            <button onClick={handleDownloadPDF} className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900">
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Date *</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Date *</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleUpdate}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Report
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Trips</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">S/N</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Truck No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Goats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sheep</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reportData.map((item, index) => (
                  <tr key={`${item.trip.form_no}-${index}`}>
                    <td className="px-6 py-4 text-sm text-slate-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(item.trip.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.trip.region || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.trip.truck_no || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.goats_count}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.sheep_count}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.total_animals}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-slate-900">
                    Total
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{totals.goats}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{totals.sheep}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{totals.total}</td>
                </tr>
              </tfoot>
            </table>
            {!reportData.length && (
              <div className="text-center py-12 text-slate-500">
                No trips for this supplier in the selected date range.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

