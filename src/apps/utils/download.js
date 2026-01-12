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
 * Tải xuống file dạng PDF sử dụng browser's print API
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
    // Tạo một window mới để print
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      throw new Error('Không thể mở cửa sổ in. Vui lòng cho phép popup.')
    }

    // Clone nội dung
    const clonedContent = element.cloneNode(true)

    // Tạo HTML cho print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              background: #fff;
              padding: 20px;
            }

            /* Markdown styles */
            h1, h2, h3, h4, h5, h6 {
              margin-top: 24px;
              margin-bottom: 16px;
              font-weight: 600;
              line-height: 1.25;
            }

            h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
            h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
            h3 { font-size: 1.25em; }
            h4 { font-size: 1em; }
            h5 { font-size: 0.875em; }
            h6 { font-size: 0.85em; color: #666; }

            p {
              margin-bottom: 16px;
            }

            a {
              color: #0366d6;
              text-decoration: none;
            }

            a:hover {
              text-decoration: underline;
            }

            ul, ol {
              padding-left: 2em;
              margin-bottom: 16px;
            }

            li {
              margin-bottom: 4px;
            }

            code {
              background-color: #f6f8fa;
              border-radius: 3px;
              font-size: 85%;
              margin: 0;
              padding: 0.2em 0.4em;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            }

            pre {
              background-color: #f6f8fa;
              border-radius: 3px;
              font-size: 85%;
              line-height: 1.45;
              overflow: auto;
              padding: 16px;
              margin-bottom: 16px;
            }

            pre code {
              background-color: transparent;
              border: 0;
              display: inline;
              line-height: inherit;
              margin: 0;
              overflow: visible;
              padding: 0;
              word-wrap: normal;
            }

            blockquote {
              border-left: 4px solid #ddd;
              color: #666;
              padding-left: 16px;
              margin-bottom: 16px;
            }

            table {
              border-collapse: collapse;
              border-spacing: 0;
              margin-bottom: 16px;
              width: 100%;
            }

            table th,
            table td {
              border: 1px solid #ddd;
              padding: 6px 13px;
            }

            table th {
              background-color: #f6f8fa;
              font-weight: 600;
            }

            table tr:nth-child(2n) {
              background-color: #f6f8fa;
            }

            img {
              max-width: 100%;
              height: auto;
            }

            hr {
              border: 0;
              border-top: 1px solid #eee;
              height: 0;
              margin: 24px 0;
            }

            /* Print specific styles */
            @media print {
              body {
                padding: 0;
              }
              
              a {
                color: #000;
                text-decoration: none;
              }
              
              pre, code {
                background-color: #f0f0f0;
                border: 1px solid #ccc;
              }
            }

            @page {
              margin: 2cm;
            }
          </style>
        </head>
        <body>
          <div id="content"></div>
        </body>
      </html>
    `)

    // Thêm nội dung
    printWindow.document.getElementById('content').appendChild(clonedContent)
    printWindow.document.close()

    // Đợi content load xong
    await new Promise(resolve => {
      if (printWindow.document.readyState === 'complete') {
        resolve()
      } else {
        printWindow.addEventListener('load', resolve)
      }
    })

    // Đợi thêm một chút để đảm bảo render xong
    await new Promise(resolve => setTimeout(resolve, 500))

    // Trigger print dialog
    printWindow.focus()
    printWindow.print()

    // Đóng window sau khi print (hoặc cancel)
    setTimeout(() => {
      printWindow.close()
    }, 100)

  } catch (error) {
    console.error('Lỗi khi tạo PDF:', error)
    throw new Error('Không thể tạo file PDF')
  }
}
