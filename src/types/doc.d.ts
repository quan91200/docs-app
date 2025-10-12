/**
 * @file doc.d.ts
 * @description Kiểu dữ liệu đại diện cho 1 document Markdown trong hệ thống.
 */
export interface Doc {
  id?: number
  filename: string
  content: string
  createdAt: string
  updatedAt: string

  /** ID thư mục chứa file (null = ở thư mục gốc) */
  folderId?: number | null
}
