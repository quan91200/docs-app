import BaseLifecycle from '@/apps/core/BaseLifecycle'

import {
  ref,
  watch,
  nextTick,
} from 'vue'

import {
  useDocsStore,
} from '@/stores/docs.store'

/**
 * DialogContext
 *
 * @extends {BaseLifecycle}
 */
export default class DialogContext extends BaseLifecycle {
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
    this._isOpen = ref(false)
    this._filename = ref('')
    this._errorMsg = ref('')
    this._inputRef = ref(null)
    this._isNewDoc = ref(true)
    this._currentDocId = ref(null)
  }

  static create({
    emit,
  }) {
    return new this(emit)
  }

  /**
   * Setup context với props từ component
   */
  setupComponent(props) {
    // watch props.isOpen
    watch(
      () => props.isOpen,
      async (open) => {
        if (open) {
          this._errorMsg.value = ''

          this._currentDocId.value = props.docId ?? null
          this._isNewDoc.value = !(props.docId ?? false)

          this._filename.value = props.currentFilename
            ? String(props.currentFilename).replace(/\.md$/, '')
            : ''

          this._isOpen.value = true

          await nextTick()

          this._inputRef
            .value
            ?.focus()

          this._inputRef
            .value
            ?.select()
        } else {
          // when parent closed dialog, reset local state
          this._isOpen.value = false
          this._filename.value = ''
          this._errorMsg.value = ''
          this._currentDocId.value = null
        }
      },
      { immediate: true }
    )

    return this
  }

  // -------------------------
  // Getter / Setter for filename (so v-model works)
  // -------------------------
  get filename() {
    return this._filename.value
  }
  set filename(val) {
    // normalize to string
    this._filename.value = val == null ? '' : String(val)
  }

  get errorMsg() {
    return this._errorMsg.value || ''
  }

  get isNewDoc() {
    return this._isNewDoc.value
  }

  get currentDocId() {
    return this._currentDocId.value
  }

  // Expose inputRef so template can assign element: use :ref="el => context._inputRef.value = el"
  get inputRef() {
    return this._inputRef
  }

  // -------------------------
  // Actions
  // -------------------------

  /**
   * Đóng dialog
   */
  close() {
    this.emit('close')
  }

  /**
   * Validate tên file
   *
   * @returns {Boolean} true nếu hợp lệ
   */
  validateFilename() {
    const name = this._filename.value.trim()
    if (!name) {
      this._errorMsg.value = 'Tên file không được để trống'

      return false
    }
    if (!/^[a-zA-Z0-9-_ ]+$/.test(name)) {
      this._errorMsg.value =
        'Tên file chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới'

      return false
    }

    return true
  }

  /**
   * Lưu hoặc đổi tên file
   */
  async save() {
    if (!this.validateFilename()) return

    const nameWithExt = `${this._filename.value.trim()}.md`

    try {
      // Kiểm tra trùng tên
      const exists = await this.docsStore.checkFilenameExists(
        nameWithExt,
        this._currentDocId.value,
      )

      if (exists) {
        this._errorMsg.value = 'Tên file đã tồn tại. Vui lòng chọn tên khác.'

        return
      }

      if (this._isNewDoc.value) {
        this.emit('save', nameWithExt)
      } else {
        this.emit('rename', nameWithExt)
      }

      this.close()
    } catch (err) {
      this._errorMsg.value = err.message || 'Có lỗi xảy ra'
    }
  }
}
