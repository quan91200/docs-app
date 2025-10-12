/**
 * ----------------------------------------
 * 📄 Bộ hàm xử lý văn bản Markdown & HTML
 * ----------------------------------------
 * Chức năng:
 *  - Phát hiện & chuyển đổi URL thành link Markdown.
 *  - Chuyển thẻ <script> trong nội dung thành block code Markdown.
 *  - Chèn văn bản vào vị trí con trỏ (dùng cho textarea/editor).
 *  - Phát hiện bullet/number list trong Markdown.
 */

// ============================
// 🔹 Biểu thức chính quy (Regex)
// ============================

/**
 * Mẫu regex dùng để phát hiện URL hợp lệ trong văn bản.
 * Hỗ trợ cả http và https.
 *
 * Ví dụ khớp:
 * - http://example.com
 * - https://github.com/user/repo
 */
const URL_REGEX = /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gu

/**
 * Mẫu regex dùng để phát hiện thẻ <script> trong nội dung HTML.
 * Lấy toàn bộ nội dung bên trong cặp thẻ.
 */
const SCRIPT_TAG_REGEX = /<script\b[^>]*>([\s\S]*?)<\/script>/giu

/**
 * Mẫu regex phát hiện các dòng Markdown dạng bullet list.
 * Ví dụ:
 * - item
 * * item
 */
export const BULLET_MATCH_REGEX = /^(\s*[-*]\s+)/u

/**
 * Mẫu regex phát hiện các dòng Markdown dạng numbered list.
 * Ví dụ:
 * 1. item
 * 2. item
 */
export const NUMBER_MATCH_REGEX = /^(\d+)(?:\.\s+)/u

// ============================
// 🔹 Các hàm xử lý Markdown/Text
// ============================

/**
 * Kiểm tra xem một đoạn văn bản có phải là link Markdown hay không.
 * Dạng hợp lệ: `[tên hiển thị](đường_dẫn)`
 *
 * @param {string} text - Chuỗi văn bản cần kiểm tra
 * @returns {boolean} `true` nếu là link Markdown, ngược lại `false`
 *
 * @example
 * isMarkdownLink("[Google](https://google.com)") // true
 * isMarkdownLink("https://google.com") // false
 */
function isMarkdownLink(text) {
  return /^\[.*\]\(.*\)$/u.test(text)
}

/**
 * Tự động chuyển tất cả các URL thuần trong chuỗi
 * sang dạng link Markdown `[url](url)`.
 *
 * Nếu chuỗi đã là Markdown link, sẽ không chuyển đổi nữa.
 *
 * @param {string} text - Chuỗi cần xử lý
 * @returns {string} Chuỗi sau khi được thay thế
 *
 * @example
 * convertUrlsToMarkdownLinks("Xem tại https://github.com")
 * // "Xem tại [https://github.com](https://github.com)"
 */
export function convertUrlsToMarkdownLinks(text) {
  if (!isMarkdownLink(text)) {
    return text.replace(URL_REGEX, url => `[${url}](${url})`)
  }

  return text
}

/**
 * Chèn một đoạn văn bản vào vị trí được chọn trong chuỗi hiện tại.
 * Dùng khi muốn thêm nội dung vào editor/textarea theo vị trí con trỏ.
 *
 * @param {Object} params - Thông tin cần thiết để chèn text
 * @param {string} params.currentContent - Nội dung hiện tại
 * @param {string} params.insertedText - Đoạn văn bản cần chèn
 * @param {number} params.selectionStart - Vị trí bắt đầu chọn
 * @param {number} params.selectionEnd - Vị trí kết thúc chọn
 * @returns {string} Nội dung mới sau khi chèn
 *
 * @example
 * generateTextAtSelection({
 *   currentContent: "Hello World",
 *   insertedText: "beautiful ",
 *   selectionStart: 6,
 *   selectionEnd: 6
 * })
 * // "Hello beautiful World"
 */
export function generateTextAtSelection({
  currentContent,
  insertedText,
  selectionStart,
  selectionEnd,
}) {
  const newContent = currentContent.substring(0, selectionStart)
    + insertedText
    + currentContent.substring(selectionEnd)

  return newContent
}

/**
 * Xử lý nội dung có chứa thẻ <script> bằng cách
 * thay thế chúng bằng block code Markdown.
 *
 * Hữu ích khi hiển thị nội dung HTML an toàn trong Markdown editor.
 *
 * @param {string} content - Chuỗi nội dung HTML đầu vào
 * @returns {string} Chuỗi nội dung đã được thay thế
 *
 * @example
 * convertProcessContent("<script>alert('Hi')</script>")
 * // ```
 * // ```javascript
 * // alert('Hi')
 * // ```
 * // ```
 */
export function convertProcessContent(content) {
  return content.replace(
    SCRIPT_TAG_REGEX,
    (match, scriptContent) =>
      insertToCodeBlock({
        content: scriptContent,
      })
  )
}

/**
 * Tạo block code Markdown từ nội dung cho trước.
 * Mặc định sử dụng ngôn ngữ `javascript` nếu không chỉ định.
 *
 * @param {Object} params - Tham số đầu vào
 * @param {string} params.content - Nội dung code
 * @param {string} [params.language='javascript'] - Tên ngôn ngữ (tuỳ chọn)
 * @returns {string} Chuỗi Markdown chứa block code
 *
 * @example
 * insertToCodeBlock({ content: "console.log('test')", language: "js" })
 * // ```
 * // ```js
 * // console.log('test')
 * // ```
 * // ```
 */
export function insertToCodeBlock({
  content,
  language = 'javascript',
}) {
  return `\n\`\`\`${language}\n${content.trim()}\n\`\`\`\n`
}
