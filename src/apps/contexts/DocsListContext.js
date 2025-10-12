import BaseLifecycle from '@/apps/core/BaseLifecycle'

import {
  ref,
  watch,
} from 'vue'

import {
  useRoute,
} from 'vue-router'

import {
  useDocsStore,
} from '@/stores/docs.store'

export default class DocsListContext extends BaseLifecycle {
  /**
   * Constructor.
   * 
   * @param {Function} emit
   */
  constructor(emit) {
    super()

    this.emit = emit
    this.docsStore = useDocsStore()

    // Reactive state
    this.isLoading = ref(false)

    this.route = useRoute()
  }

  static create({
    emit,
  }) {
    return new this(emit)
  }

  /**
   * Setup component
   */
  async setupComponent() {
    await this.docsStore.loadDocs()
    // Theo dõi thay đổi của route (id)
    watch(
      () => this.route.params.id,
      async (id) => {
        if (!id) return

        // Lấy doc tương ứng trong store
        const doc = this.docsStore.getDocById(Number(id))
        if (doc) {
          this.docsStore.setCurrentDoc(doc)
        } else {
          // Nếu chưa load, thử load riêng
          const loaded = await this.docsStore.loadDoc(Number(id))
          if (loaded) {
            this.docsStore.setCurrentDoc(loaded)
          }
        }
      },
      { immediate: true }
    )

    return this
  }

  /**
   * Khi reload hoặc mount, đồng bộ route và store
   */
  syncCurrentDocWithRoute() {
    const id = Number(this.route.params.id)
    if (!id) return

    const existing = this.docsStore.getDocById(id)
    if (existing) {
      this.docsStore.setCurrentDoc(existing)
    } else {
      this.docsStore.loadDoc(id)
    }
  }

  /**
   * Kiểm tra document hiện tại có đang active
   */
  isActive(doc) {
    return this.docsStore.currentDoc?.id === doc.id
  }

  /**
   * Định dạng ngày hiển thị
   */
  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 86400000) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days} ngày trước`
    }

    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Emit sự kiện chọn document
   */
  handleSelect(doc) {
    this.emit('select', doc)
  }

  /**
   * Emit sự kiện tạo file mới
   */
  handleCreate() {
    this.emit('create')
  }

  /**
   * Emit sự kiện đổi tên
   */
  handleRename(doc) {
    this.emit('rename', doc)
  }

  /**
   * Emit sự kiện xóa
   */
  handleDelete(doc) {
    this.emit('delete', doc)
  }
}
