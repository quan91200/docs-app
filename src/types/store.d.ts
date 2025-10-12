/**
 * @file store.d.ts
 * @description Kiểu dữ liệu cho Pinia store useDocsStore
 */

import type {
  Doc,
} from '@/types/doc'

export interface DocsState {
  docs: Doc[]
  currentDoc: Doc | null
  isLoading: boolean
  error: string | null
}

export interface DocsActions {
  loadDocs(): Promise<void>
  loadDoc(id: number): Promise<void>
  createNew(filename?: string): Promise<Doc>
  save(doc: Doc): Promise<void>
  remove(id: number): Promise<void>
  rename(id: number, newFilename: string): Promise<void>
  updateCurrentContent(content: string): Promise<void>
  checkFilenameExists(filename: string, excludeId?: number): Promise<boolean>
  setCurrentDoc(doc: Doc): void
  clearCurrentDoc(): void
  clearError(): void
}
