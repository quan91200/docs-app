<script>
import {
  defineComponent,
  ref,
  computed,
} from 'vue'

import {
  useDocsStore,
} from '@/stores/docs.store'

import {
  downloadMarkdown,
  downloadPDF,
} from '@/apps/utils/download'

import {
  PhDownload,
  PhFileText,
  PhFilePdf,
} from '@phosphor-icons/vue'

export default defineComponent({
  name: 'Header',

  components: {
    PhDownload,
    PhFileText,
    PhFilePdf,
  },

  setup() {
    const docsStore = useDocsStore()
    const showDownloadMenu = ref(false)

    const hasCurrentDoc = computed(() => !!docsStore.currentDoc)
    const currentFilename = computed(() => {
      if (!docsStore.currentDoc) return ''
      return docsStore.currentDoc.filename.replace(/\.md$/, '')
    })

    /**
     * Tải xuống file dạng Markdown
     */
    function handleDownloadMarkdown() {
      if (!docsStore.currentDoc) return

      downloadMarkdown(
        currentFilename.value,
        docsStore.currentDoc.content || ''
      )
      showDownloadMenu.value = false
    }

    /**
     * Tải xuống file dạng PDF
     */
    async function handleDownloadPDF() {
      if (!docsStore.currentDoc) return

      try {
        // Tìm element chứa nội dung markdown preview
        const previewElement = document.querySelector('.md-editor-preview-wrapper')
        
        if (!previewElement) {
          alert('Không tìm thấy nội dung để xuất PDF')
          return
        }

        await downloadPDF(currentFilename.value, previewElement)
        showDownloadMenu.value = false
      } catch (error) {
        console.error('Lỗi khi tải PDF:', error)
        alert('Có lỗi xảy ra khi tạo file PDF')
      }
    }

    /**
     * Toggle dropdown menu
     */
    function toggleDownloadMenu() {
      showDownloadMenu.value = !showDownloadMenu.value
    }

    /**
     * Đóng menu khi click bên ngoài
     */
    function closeMenu() {
      showDownloadMenu.value = false
    }

    return {
      hasCurrentDoc,
      showDownloadMenu,
      toggleDownloadMenu,
      handleDownloadMarkdown,
      handleDownloadPDF,
      closeMenu,
    }
  },
})
</script>

<template>
  <header class="header">
    <div class="header__logo">My Documents</div>
    
    <div v-if="hasCurrentDoc" class="header__actions">
      <div class="download-wrapper" @click.stop>
        <button 
          class="btn-download"
          @click="toggleDownloadMenu"
          :class="{ active: showDownloadMenu }"
        >
          <PhDownload :size="18" weight="bold" />
          <span>Tải xuống</span>
        </button>
        
        <div v-if="showDownloadMenu" class="download-menu">
          <button 
            class="menu-item"
            @click="handleDownloadMarkdown"
          >
            <PhFileText :size="18" />
            <span>Tải xuống MD</span>
          </button>
          <button 
            class="menu-item"
            @click="handleDownloadPDF"
          >
            <PhFilePdf :size="18" />
            <span>Tải xuống PDF</span>
          </button>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Overlay để đóng menu khi click bên ngoài -->
  <div 
    v-if="showDownloadMenu" 
    class="menu-overlay"
    @click="closeMenu"
  ></div>
</template>

<style scoped>
.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
}

.header__logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.header__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.download-wrapper {
  position: relative;
}

.btn-download {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-download:hover,
.btn-download.active {
  background: #2563eb;
}

.download-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}
</style>
