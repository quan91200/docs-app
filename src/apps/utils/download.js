import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Tải xuống file dạng Markdown (.md)
 * 
 * @param {string} filename - Tên file (không cần extension)
 * @param {string} content - Nội dung markdown
 */
export function downloadMarkdown(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${filename}.md`
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Tải xuống file dạng PDF từ HTML element
 * 
 * @param {string} filename - Tên file (không cần extension)
 * @param {HTMLElement} element - Element chứa nội dung cần xuất PDF
 * @returns {Promise<void>}
 */
export async function downloadPDF(filename, element) {
  if (!element) {
    throw new Error('Element không tồn tại')
  }

  try {
    // Tạo canvas từ HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
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

    // Thêm trang đầu tiên
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Thêm các trang tiếp theo nếu nội dung dài
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Lỗi khi tạo PDF:', error)
    throw new Error('Không thể tạo file PDF')
  }
}
