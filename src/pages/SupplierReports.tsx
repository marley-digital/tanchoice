import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getSupplierReport, getSuppliers } from '../lib/api'
import type { Supplier } from '../types'
import { downloadCSV, generateCSV } from '../lib/csv'
import { generateMonthlyReportPDF } from '../lib/pdf'

export default function SupplierReports() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    region: '',
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers()
      setSuppliers(data)
    } catch (error: any) {
      alert('Error loading suppliers: ' + error.message)
    }
  }

  const handleGenerate = async () => {
    try {
      setLoading(true)
      const data = await getSupplierReport(filters.fromDate, filters.toDate, filters.region || undefined)
      setReportData(data)
    } catch (error: any) {
      alert('Error generating report: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const aggregatedData = useMemo(() => {
    const map = new Map<string, { supplier_id: string; name: string; goats: number; sheep: number; total: number }>()
    reportData.forEach((item) => {
      if (!item) return
      const supplierId = item.supplier_id
      const current = map.get(supplierId) || {
        supplier_id: supplierId,
        name: item.supplier?.name || 'Unknown',
        goats: 0,
        sheep: 0,
        total: 0,
      }
      current.goats += item.goats_count || 0
      current.sheep += item.sheep_count || 0
      current.total += item.total_animals || 0
      map.set(supplierId, current)
    })
    return Array.from(map.values())
  }, [reportData])

  const totals = aggregatedData.reduce(
    (acc, supplier) => {
      acc.goats += supplier.goats
      acc.sheep += supplier.sheep
      acc.total += supplier.total
      return acc
    },
    { goats: 0, sheep: 0, total: 0 },
  )

  const handleExportCSV = () => {
    const csvData = aggregatedData.map((supplier) => ({
      supplier_name: supplier.name,
      total_goats: supplier.goats,
      total_sheep: supplier.sheep,
      total_animals: supplier.total,
    }))
    const csv = generateCSV(csvData, ['Supplier Name', 'Total Goats', 'Total Sheep', 'Total Animals'])
    downloadCSV(csv, `supplier-report-${filters.fromDate}-${filters.toDate}.csv`)
  }

  const handleDownloadPDF = () => {
    const doc = generateMonthlyReportPDF(reportData, filters.fromDate, filters.toDate, filters.region || undefined)
    doc.save(`supplier-report-${filters.fromDate}-${filters.toDate}.pdf`)
  }

  const uniqueRegions = Array.from(new Set(suppliers.map((s) => s.region).filter(Boolean) as string[]))

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase text-slate-500 tracking-wide">Supplier Insights</p>
            <h1 className="text-3xl font-bold text-slate-900">Monthly / Yearly Reports</h1>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All regions</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {reportData.length > 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900"
                >
                  Download PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">S/N</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Goats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Sheep</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Animals</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {aggregatedData.map((supplier, index) => (
                    <tr key={supplier.supplier_id}>
                      <td className="px-6 py-4 text-sm text-slate-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{supplier.goats}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{supplier.sheep}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{supplier.total}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => navigate(`/reports/suppliers/${supplier.supplier_id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-slate-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{totals.goats}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{totals.sheep}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{totals.total}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center text-slate-500">
            Generate a report to see supplier totals.
          </div>
        )}
      </div>
    </div>
  )
}

