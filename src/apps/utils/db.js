import {
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
  FOLDER_STORE,
} from '@/apps/constants'

/**
 * Mở kết nối IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Tạo store cho document
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        })

        // Tạo index để search theo filename
        objectStore.createIndex('filename', 'filename', { unique: true })
        objectStore.createIndex('createdAt', 'createdAt', { unique: false })
        objectStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Tạo store cho folder
      if (!db.objectStoreNames.contains(FOLDER_STORE)) {
        const folders = db.createObjectStore(FOLDER_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        })

        folders.createIndex('name', 'name', { unique: false })
        folders.createIndex('parentId', 'parentId', { unique: false })
      }
    }
  })
}

/** ========================== 📁 DOCS FUNCTIONS ========================== */

/**
 * Lấy tất cả documents
 */
export async function getAllDocs() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.getAll()

    request.onsuccess = () => {
      // Sắp xếp theo updatedAt mới nhất
      const docs = request.result.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )
      resolve(docs)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Lấy một document theo ID
 */
export async function getDoc(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Lấy document theo filename
 */
export async function getDocByFilename(filename) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const index = objectStore.index('filename')
    const request = index.get(filename)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Lưu hoặc cập nhật document
 */
export async function saveDoc(doc) {
  const db = await openDB()

  // Chuẩn hóa dữ liệu
  const now = new Date().toISOString()
  const docData = {
    ...doc,
    updatedAt: now,
    createdAt: doc.createdAt || now,
    filename: doc.filename || `untitled-${Date.now()}.md`
  }

  // Đảm bảo filename có đuôi .md
  if (!docData.filename.endsWith('.md')) {
    docData.filename += '.md'
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)

    // Dùng put để tự động insert/update
    const request = objectStore.put(docData)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      // Xử lý lỗi trùng filename
      if (request.error.name === 'ConstraintError') {
        reject(new Error('Tên file đã tồn tại. Vui lòng chọn tên khác.'))
      } else {
        reject(request.error)
      }
    }
  })
}

/**
 * Xóa document theo ID
 */
export async function deleteDoc(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Tạo document mới
 */
export async function createNewDoc(filename = null) {
  const now = new Date().toISOString()
  const defaultFilename = filename || `untitled-${Date.now()}.md`

  const newDoc = {
    filename: defaultFilename,
    content: '',
    createdAt: now,
    updatedAt: now
  }

  const id = await saveDoc(newDoc)
  return { ...newDoc, id }
}

/**
 * Kiểm tra filename có tồn tại không
 */
export async function isFilenameExists(filename, excludeId = null) {
  const doc = await getDocByFilename(filename)
  if (!doc) return false
  if (excludeId && doc.id === excludeId) return false
  return true
}

/**
 * Đổi tên file
 */
export async function renameDoc(id, newFilename) {
  // Đảm bảo có đuôi .md
  const filename = newFilename.endsWith('.md') ? newFilename : `${newFilename}.md`

  // Kiểm tra trùng tên
  const exists = await isFilenameExists(filename, id)
  if (exists) {
    throw new Error('Tên file đã tồn tại. Vui lòng chọn tên khác.')
  }

  const doc = await getDoc(id)
  if (!doc) {
    throw new Error('Không tìm thấy file.')
  }

  doc.filename = filename
  doc.updatedAt = new Date().toISOString()

  await saveDoc(doc)
  return doc
}

/** ========================== 📁 FOLDER FUNCTIONS ========================== */

/**
 * Tạo thư mục mới
 */
export async function createFolder(name, parentId = null) {
  const db = await openDB()
  const now = new Date().toISOString()
  const folder = { name, parentId, createdAt: now, updatedAt: now }

  return new Promise((resolve, reject) => {
    const tx = db.transaction([FOLDER_STORE], 'readwrite')
    const store = tx.objectStore(FOLDER_STORE)
    const req = store.add(folder)

    req.onsuccess = () => resolve({ ...folder, id: req.result })
    req.onerror = () => reject(req.error)
  })
}

/**
 * Lấy toàn bộ thư mục
 */
export async function getAllFolders() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FOLDER_STORE], 'readonly')
    const store = tx.objectStore(FOLDER_STORE)
    const req = store.getAll()

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Đổi tên thư mục
 */
export async function renameFolder(id, newName) {
  const db = await openDB()
  const folder = await getFolder(id)
  if (!folder) throw new Error('Không tìm thấy thư mục')

  folder.name = newName
  folder.updatedAt = new Date().toISOString()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([FOLDER_STORE], 'readwrite')
    const store = tx.objectStore(FOLDER_STORE)
    const req = store.put(folder)

    req.onsuccess = () => resolve(folder)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Lấy thư mục theo ID
 */
export async function getFolder(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FOLDER_STORE], 'readonly')
    const store = tx.objectStore(FOLDER_STORE)
    const req = store.get(id)

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Xóa thư mục (và các file bên trong)
 */
export async function deleteFolder(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FOLDER_STORE, STORE_NAME], 'readwrite')

    // Xóa thư mục
    tx.objectStore(FOLDER_STORE).delete(id)

    // Xóa các doc thuộc thư mục đó
    const docsStore = tx.objectStore(STORE_NAME)
    const index = docsStore.index('folderId')
    const req = index.getAllKeys(id)

    req.onsuccess = () => {
      req.result.forEach(key => docsStore.delete(key))
      resolve()
    }

    req.onerror = () => reject(req.error)
  })
}
