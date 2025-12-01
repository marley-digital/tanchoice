import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { TripWithAnimals } from '../types'

// Company logo as base64 SVG - simplified version
const COMPANY_LOGO = 'data:image/svg+xml;base64,' + btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">' +
  '<rect width="200" height="60" fill="%2300568f"/>' +
  '<text x="100" y="35" font-family="Arial,sans-serif" font-size="20" fill="white" text-anchor="middle" font-weight="bold">TANCHOICE LTD</text>' +
  '<text x="100" y="55" font-family="Arial,sans-serif" font-size="12" fill="white" text-anchor="middle">Simply Organic Meat</text>' +
  '</svg>'
)

export const generateTripPDF = (trip: TripWithAnimals) => {
  const doc = new jsPDF()

  // Add company logo at the top
  try {
    doc.addImage(COMPANY_LOGO, 'SVG', 10, 10, 60, 18)
  } catch (error) {
    console.warn('Failed to add logo to PDF, continuing without it:', error)
  }
  
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('TANCHOICE LIMITED – Simply Organic Meat', 105, 35, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  let yPos = 50

  doc.text(`Region: ${trip.region}`, 14, yPos)
  doc.text(`Truck No: ${trip.truck_no}`, 105, yPos)
  yPos += 7
  doc.text(`Date: ${new Date(trip.date).toLocaleDateString()}`, 14, yPos)
  doc.text(`Form No: ${trip.form_no}`, 105, yPos)
  yPos += 12

  const tableData = trip.animals.map((animal, index) => [
    (index + 1).toString(),
    animal.supplier?.name || 'Unknown',
    animal.mark,
    animal.goats_count.toString(),
    animal.sheep_count.toString(),
    animal.total_animals.toString(),
  ])

  const totalGoats = trip.animals.reduce((sum, a) => sum + a.goats_count, 0)
  const totalSheep = trip.animals.reduce((sum, a) => sum + a.sheep_count, 0)
  const totalAnimals = trip.animals.reduce((sum, a) => sum + a.total_animals, 0)

  tableData.push([
    'TOTAL',
    '',
    '',
    totalGoats.toString(),
    totalSheep.toString(),
    totalAnimals.toString(),
  ])

  autoTable(doc, {
    head: [['S/N', "Supplier's Name", 'Mark / Symbol', 'Goats', 'Sheep', 'Total Summary']],
    body: tableData,
    startY: yPos,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 86, 143], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 60
  const footerY = finalY + 15

  doc.text(`Prepared by: ${trip.prepared_by_position || ''} ${trip.prepared_by_name || ''}`, 14, footerY)
  doc.line(80, footerY - 3, 190, footerY - 3)
  doc.text(`Driver: ${trip.driver_name}`, 14, footerY + 10)
  doc.line(40, footerY + 7, 100, footerY + 7)
  doc.text(`Escort: ${trip.escort_name}`, 120, footerY + 10)
  doc.line(150, footerY + 7, 200, footerY + 7)

  return doc
}

export const generateSupplierReportPDF = (
  supplierName: string,
  reportData: any[],
  fromDate: string,
  toDate: string,
) => {
  const doc = new jsPDF()

  // Add company logo at the top
  try {
    doc.addImage(COMPANY_LOGO, 'SVG', 10, 10, 60, 18)
  } catch (error) {
    console.warn('Failed to add logo to PDF, continuing without it:', error)
  }
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('TANCHOICE LIMITED – Simply Organic Meat', 105, 35, { align: 'center' })
  doc.text('Supplier Report', 105, 45, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Supplier: ${supplierName}`, 14, 57)
  doc.text(`Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`, 14, 64)

  const tableData = reportData.map((item, index) => [
    (index + 1).toString(),
    new Date(item.trip.date).toLocaleDateString(),
    item.trip.region || '',
    item.trip.truck_no || '',
    item.goats_count.toString(),
    item.sheep_count.toString(),
    item.total_animals.toString(),
  ])

  const totalGoats = reportData.reduce((sum, item) => sum + item.goats_count, 0)
  const totalSheep = reportData.reduce((sum, item) => sum + item.sheep_count, 0)
  const totalAnimals = reportData.reduce((sum, item) => sum + item.total_animals, 0)

  tableData.push([
    'TOTAL',
    '',
    '',
    '',
    totalGoats.toString(),
    totalSheep.toString(),
    totalAnimals.toString(),
  ])

  autoTable(doc, {
    head: [['S/N', 'Date', 'Region', 'Truck No', 'Goats', 'Sheep', 'Total Animals']],
    body: tableData,
    startY: 72,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 86, 143], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  return doc
}

export const generateMonthlyReportPDF = (
  reportData: any[],
  fromDate: string,
  toDate: string,
  region?: string,
) => {
  const doc = new jsPDF()

  // Add company logo at the top
  try {
    doc.addImage(COMPANY_LOGO, 'SVG', 10, 10, 60, 18)
  } catch (error) {
    console.warn('Failed to add logo to PDF, continuing without it:', error)
  }
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('TANCHOICE LIMITED – Simply Organic Meat', 105, 35, { align: 'center' })
  doc.text('Supplier Summary Report', 105, 45, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`, 14, 57)
  if (region) {
    doc.text(`Region: ${region}`, 14, 64)
  }

  const supplierMap = new Map<string, { name: string; goats: number; sheep: number; total: number }>()

  reportData.forEach((item: any) => {
    const supplierId = item.supplier_id
    const supplierName = item.supplier?.name || 'Unknown'

    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, { name: supplierName, goats: 0, sheep: 0, total: 0 })
    }

    const supplier = supplierMap.get(supplierId)!
    supplier.goats += item.goats_count
    supplier.sheep += item.sheep_count
    supplier.total += item.total_animals
  })

  const tableData = Array.from(supplierMap.entries()).map(([_, data], index) => [
    (index + 1).toString(),
    data.name,
    data.goats.toString(),
    data.sheep.toString(),
    data.total.toString(),
  ])

  const totalGoats = Array.from(supplierMap.values()).reduce((sum, s) => sum + s.goats, 0)
  const totalSheep = Array.from(supplierMap.values()).reduce((sum, s) => sum + s.sheep, 0)
  const totalAnimals = Array.from(supplierMap.values()).reduce((sum, s) => sum + s.total, 0)

  tableData.push([
    'TOTAL',
    '',
    totalGoats.toString(),
    totalSheep.toString(),
    totalAnimals.toString(),
  ])

  autoTable(doc, {
    head: [['S/N', 'Supplier Name', 'Total Goats', 'Total Sheep', 'Total Animals']],
    body: tableData,
    startY: 72,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 86, 143], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  return doc
}