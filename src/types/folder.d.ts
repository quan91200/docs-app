/**
 * @file folder.d.ts
 * @description Kiểu dữ liệu đại diện cho 1 thư mục chứa file Markdown.
 */

export interface Folder {
  /** ID trong IndexedDB */
  id?: number

  /** Tên thư mục */
  name: string

  /** ID thư mục cha (nếu có) */
  parentId?: number | null

  /** Thời điểm tạo */
  createdAt: string

  /** Thời điểm cập nhật */
  updatedAt: string
}
