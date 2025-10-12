import {
  watch,
  onBeforeUnmount,
} from 'vue'

import {
  MARK_DOWN_TOOLBAR_PREVIEW,
} from '@/apps/constants'

import {
  useDocsStore,
} from '@/stores/docs.store'

import {
  debounce
} from 'lodash'

/**
 * Lớp MarkDownEditorContext
 *
 * Lớp này giúp quản lý trạng thái và hành vi của trình chỉnh sửa Markdown
 * (chế độ viết, xem trước, đồng bộ dữ liệu, upload hình,...)
 */
export default class MarkDownEditorContext {
  // ========================================================
  // KHỞI TẠO
  // ========================================================

  /**
   * Hàm khởi tạo của Markdown Editor Context
   *
   * @param {Object} params - Tham số truyền vào.
   * @param {Object} params.props - Props của component (gồm modelValue, label, name, placeholder, v.v.)
   * @param {import('vue').SetupContext} params.componentContext - Context setup của Vue (emit, slots, attrs,...)
   * @param {import('vue').Ref<string>} params.contentRef - Biến reactive lưu nội dung markdown hiện tại.
   * @param {import('vue').Ref<Array<string>>} params.toolbarsRef - Danh sách thanh công cụ đang hiển thị.
   * @param {import('vue').Ref<import('md-editor-v3').MdEditor | null>} params.editorRef - Tham chiếu đến editor instance.
   * @param {import('vue').Ref<boolean>} params.isWriteModeRef - Biến reactive lưu trạng thái đang “viết” hay “xem trước”.
   */
  constructor({
    props,
    componentContext,
    contentRef,
    toolbarsRef,
    editorRef,
    isWriteModeRef,
  }) {
    this.props = props
    this.componentContext = componentContext

    this.contentRef = contentRef
    this.toolbarsRef = toolbarsRef
    this.editorRef = editorRef
    this.isWriteModeRef = isWriteModeRef

    this.docsStore = useDocsStore()

    // Debounce autosave
    this.autosave = debounce((val) => {
      if (this.docsStore.currentDoc) this.docsStore.updateCurrentContent(val)
    }, 500)
  }

  // ========================================================
  // FACTORY METHOD
  // ========================================================

  /**
   * Tạo nhanh một instance mới của lớp này.
   * (Giúp code ngắn gọn hơn thay vì `new MarkDownEditorContext(...)`)
   *
   * @param {Object} params - Tham số truyền vào constructor.
   * @returns {MarkDownEditorContext} Instance mới.
   */
  static create(params) {
    return new MarkDownEditorContext(params)
  }

  // ========================================================
  // THIẾT LẬP & GIÁM SÁT DỮ LIỆU
  // ========================================================

  /**
   * Gọi setup để khởi tạo các watcher (đồng bộ props ↔ nội dung).
   *
   * @returns {this} Trả về chính instance để chain.
   */
  setupComponent() {
    this.setupWatchers()
    this.setupAutosave()
    return this
  }

  /**
   * Tạo các watcher theo dõi nội dung markdown và modelValue của props.
   * Khi contentRef thay đổi → emit ra ngoài.
   * Khi props.modelValue thay đổi → cập nhật ngược lại contentRef.
   *
   * @returns {this}
   */
  setupWatchers() {
    // Khi nội dung thay đổi, emit event ra ngoài (để v-model nhận)
    watch(this.contentRef, newValue => {
      this.componentContext.emit('update:modelValue', newValue)
    })

    // Khi props.modelValue thay đổi từ ngoài → cập nhật lại nội dung editor
    watch(
      () => this.props.modelValue,
      newValue => {
        if (newValue !== this.contentRef.value) {
          this.contentRef.value = newValue
        }
      }
    )

    // Load khi currentDoc thay đổi
    watch(() => this.docsStore.currentDoc, (doc) => {
      this.contentRef.value = doc?.content || ''
    })

    return this
  }

  setupAutosave() {
    watch(this.contentRef, (val) => this.autosave(val))
    onBeforeUnmount(() => this.autosave.cancel())
  }

  // ========================================================
  // TRẠNG THÁI & THUỘC TÍNH
  // ========================================================

  /**
   * Kiểm tra có đang bật chế độ Live Preview không.
   * @returns {boolean}
   */
  get isLivePreviewMode() {
    return this.props.hasLivePreviewMode
  }

  /**
   * Lấy danh sách các nút toolbar sẽ hiển thị trong editor.
   * Nếu bật chế độ Live Preview thì thêm nút Preview vào đầu danh sách.
   *
   * @returns {Array<string>}
   */
  getToolbarsConfig() {
    if (!this.isLivePreviewMode) return this.toolbarsRef.value

    return [MARK_DOWN_TOOLBAR_PREVIEW, ...this.toolbarsRef.value]
  }

  /**
   * Lấy nhãn (label) của editor.
   * @returns {string | null}
   */
  get markdownLabel() {
    return this.props.label ?? null
  }

  /**
   * Lấy tên input (name) của editor.
   * @returns {string}
   */
  get markdownInputName() {
    return this.props.name
  }

  /**
   * Lấy placeholder cho vùng nhập markdown.
   * @returns {string}
   */
  get markdownPlaceholder() {
    return this.props.placeholder
  }

  /**
   * Lấy thông báo lỗi (nếu có).
   * @returns {string}
   */
  get errorMessage() {
    return this.props.errorMessage
  }

  /**
   * Kiểm tra hiện đang ở chế độ viết hay xem trước.
   * @returns {boolean}
   */
  get isWriteMode() {
    return this.isWriteModeRef.value
  }

  /**
   * Lấy style áp dụng cho markdown editor.
   * @returns {import('vue').CSSProperties}
   */
  get getStyleMdEditor() {
    return this.props.styleMarkdown
  }

  // ========================================================
  // CLASS UTILS (THÊM CLASS CHO ELEMENT)
  // ========================================================

  /**
   * Tạo class cho khung editor (ví dụ: write / preview).
   * @returns {{ [className: string]: boolean }}
   */
  generateMdEditorClasses() {
    return { write: this.isWriteModeRef.value }
  }

  /**
   * Tạo class cho nút “Write”.
   * @returns {{ [className: string]: boolean }}
   */
  generateButtonWriteClasses() {
    return { active: this.isWriteMode }
  }

  /**
   * Tạo class cho nút “Preview”.
   * @returns {{ [className: string]: boolean }}
   */
  generateButtonPreviewClasses() {
    return { active: !this.isWriteMode }
  }

  // ========================================================
  // HÀNH VI NGƯỜI DÙNG
  // ========================================================

  /**
   * Chuyển đổi giữa chế độ viết và xem trước.
   *
   * @returns {void}
   */
  toggleModeEditor() {
    this.isWriteModeRef.value = !this.isWriteModeRef.value
    this.editorRef.value?.togglePreviewOnly(!this.isWriteModeRef.value)
  }

  // ========================================================
  // UPLOAD HÌNH ẢNH (phiên bản local / không dùng GraphQL)
  // ========================================================

  /**
   * Upload hình ảnh vào markdown editor (phiên bản demo không GraphQL).
   * Ở đây bạn có thể thay thế bằng API upload riêng hoặc logic tùy chỉnh.
   *
   * @param {Object} params - Tham số upload.
   * @param {Array<File>} params.files - Danh sách file ảnh được chọn.
   * @param {Function} params.markdownV3EditorCallback - Callback để insert URL ảnh sau khi upload xong.
   */
  async uploadImage({ files, markdownV3EditorCallback }) {
    const [file] = files
    if (!file) return

    // Ví dụ: upload tạm thời qua API riêng (tùy bạn thay thế)
    // const response = await api.uploadImage(file)
    // const imageUrl = response.data.url

    const imageUrl = URL.createObjectURL(file) // demo: tạo link blob tạm
    await markdownV3EditorCallback([imageUrl])
  }
}
