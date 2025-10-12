import {
  defineStore
} from 'pinia'

import {
  getAllDocs,
  getDoc,
  saveDoc,
  deleteDoc,
  createNewDoc,
  renameDoc,
  isFilenameExists
} from '@/apps/utils/db'

export const useDocsStore = defineStore('docs', {
  state: () => ({
    docs: [],
    currentDoc: null,
    isLoading: false,
    error: null
  }),

  getters: {
    // Tìm doc theo ID
    getDocById: (state) => (id) => {
      return state.docs.find(doc => doc.id === id)
    },

    // Tìm doc theo filename
    getDocByFilename: (state) => (filename) => {
      return state.docs.find(doc => doc.filename === filename)
    },

    // Kiểm tra có doc nào không
    hasDocuments: (state) => state.docs.length > 0,

    // Lấy danh sách filename
    allFilenames: (state) => state.docs.map(doc => doc.filename)
  },

  actions: {
    /**
     * Load tất cả documents
     */
    async loadDocs() {
      try {
        this.isLoading = true
        this.error = null
        this.docs = await getAllDocs()
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Load một document
     */
    async loadDoc(id) {
      try {
        this.isLoading = true
        this.error = null
        this.currentDoc = await getDoc(id)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Tạo document mới
     */
    async createNew(filename = null) {
      try {
        this.isLoading = true
        this.error = null

        const newDoc = await createNewDoc(filename)
        await this.loadDocs()
        this.currentDoc = newDoc

        return newDoc
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Lưu document (tạo mới hoặc cập nhật)
     */
    async save(doc) {
      try {
        this.isLoading = true
        this.error = null

        await saveDoc(doc)
        await this.loadDocs()

        // Cập nhật currentDoc nếu đang mở
        if (this.currentDoc?.id === doc.id) {
          this.currentDoc = { ...doc }
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Xóa document
     */
    async remove(id) {
      try {
        this.isLoading = true
        this.error = null

        await deleteDoc(id)
        await this.loadDocs()

        // Clear currentDoc nếu đang mở file bị xóa
        if (this.currentDoc?.id === id) {
          this.currentDoc = null
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Cập nhật nội dung của currentDoc
     */
    async updateCurrentContent(content) {
      if (!this.currentDoc) return

      try {
        this.currentDoc.content = content
        await saveDoc(this.currentDoc)
      } catch (error) {
        this.error = error.message
      }
    },

    /**
     * Đổi tên file
     */
    async rename(id, newFilename) {
      try {
        this.isLoading = true
        this.error = null

        const updatedDoc = await renameDoc(id, newFilename)
        await this.loadDocs()

        // Cập nhật currentDoc nếu đang mở
        if (this.currentDoc?.id === id) {
          this.currentDoc = updatedDoc
        }

        return updatedDoc
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Kiểm tra tên file có tồn tại không
     */
    async checkFilenameExists(filename, excludeId = null) {
      return await isFilenameExists(filename, excludeId)
    },

    /**
     * Đặt currentDoc
     */
    setCurrentDoc(doc) {
      this.currentDoc = doc
    },

    /**
     * Clear currentDoc
     */
    clearCurrentDoc() {
      this.currentDoc = null
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    }
  }
})
