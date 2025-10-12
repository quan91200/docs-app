/**
 * @file db.d.ts
 * @description Các kiểu liên quan đến IndexedDB và thao tác với document
 */

import type {
  Doc
} from '@/types/doc'

import type {
  Folder
} from '@/types/folder'

/** Kết quả trả về khi tạo mới document */
export interface CreateDocResult extends Doc {
  id: number
}

/** Interface định nghĩa các hàm thao tác IndexedDB */
export interface DocsDB {
  // ===== Documents =====
  getAllDocs(): Promise<Doc[]>
  getDoc(id: number): Promise<Doc | undefined>
  saveDoc(doc: Doc): Promise<number>
  deleteDoc(id: number): Promise<void>
  createNewDoc(filename?: string): Promise<CreateDocResult>
  renameDoc(id: number, newFilename: string): Promise<Doc>
  isFilenameExists(filename: string, excludeId?: number): Promise<boolean>

  // ===== Folders =====
  getAllFolders(): Promise<Folder[]>
  getFolder(id: number): Promise<Folder | undefined>
  createFolder(name: string, parentId?: number | null): Promise<Folder>
  renameFolder(id: number, newName: string): Promise<Folder>
  deleteFolder(id: number): Promise<void>
}
