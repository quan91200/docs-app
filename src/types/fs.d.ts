import type {
  Doc
} from '@/types/doc'

import type {
  Folder
} from '@/types/folder'

export type FileSystemItem = Doc | Folder

/** Kiểu trả về khi load cây thư mục */
export interface FolderTree {
  id: number
  name: string
  parentId: number | null
  folders: FolderTree[]
  docs: Doc[]
}
