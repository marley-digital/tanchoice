export const generateCSV = (data: Record<string, any>[], headers: string[]): string => {
  const csvRows: string[] = []
  csvRows.push(headers.join(','))

  data.forEach((row) => {
    const values = headers.map((header) => {
      const key = header.toLowerCase().replace(/\s+/g, '_')
      const value = row[key] ?? row[header] ?? ''
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  })

  return csvRows.join('\n')
}

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

