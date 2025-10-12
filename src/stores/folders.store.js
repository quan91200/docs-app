import {
  defineStore
} from 'pinia'

import {
  getAllFolders,
  createFolder,
  renameFolder,
  deleteFolder,
} from '@/apps/utils/db'

export const useFoldersStore = defineStore('folders', {
  state: () => ({
    folders: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    hasFolders: (state) => state.folders.length > 0,
  },

  actions: {
    async loadFolders() {
      try {
        this.isLoading = true
        this.folders = await getAllFolders()
      } catch (err) {
        console.error('Error loading folders:', err)
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },

    async create(name, parentId = null) {
      const folder = await createFolder(name, parentId)
      await this.loadFolders()
      return folder
    },

    async rename(id, newName) {
      const folder = await renameFolder(id, newName)
      await this.loadFolders()
      return folder
    },

    async remove(id) {
      await deleteFolder(id)
      await this.loadFolders()
    },
  },
})
