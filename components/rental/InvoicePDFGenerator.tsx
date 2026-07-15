// components/rental/InvoicePDFGenerator.tsx
'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const generatePDFFromHTML = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found')
    return false
  }

  try {
    // Show loading indicator
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(`${filename}.pdf`)
    
    // Restore body overflow
    document.body.style.overflow = originalOverflow
    
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    document.body.style.overflow = ''
    return false
  }
}