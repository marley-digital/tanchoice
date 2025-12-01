declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface UserOptions {
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    startY?: number
    styles?: Record<string, any>
    headStyles?: Record<string, any>
    bodyStyles?: Record<string, any>
    footStyles?: Record<string, any>
    alternateRowStyles?: Record<string, any>
    columnStyles?: Record<string, any>
  }

  function autoTable(doc: jsPDF, options: UserOptions): void

  export default autoTable
}

