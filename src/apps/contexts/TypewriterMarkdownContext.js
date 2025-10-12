import {
  nextTick,
  watch,
} from 'vue'

/**
 * Lớp quản lý logic hiển thị hiệu ứng gõ chữ (typewriter)
 * cho nội dung Markdown trong component Vue.
 *
 * @class
 */
export default class TypewriterMarkdownContext {
  /**
   * Hàm khởi tạo context quản lý hiệu ứng gõ chữ.
   *
   * @param {Object} params - Tham số khởi tạo.
   * @param {import('vue').Ref<string>} params.displayedContentRef - Biến phản ứng chứa nội dung hiển thị hiện tại.
   * @param {import('vue').Ref<NodeJS.Timeout|null>} params.typewriterTimeoutRef - Biến phản ứng lưu timeout hiện tại (dùng cho hiệu ứng gõ).
   * @param {import('vue').Ref<number>} params.currentIndexRef - Vị trí ký tự hiện tại đang được gõ.
   * @param {import('vue').Ref<string>} params.previousContentRef - Lưu nội dung trước đó để so sánh khi có thay đổi.
   * @param {import('vue').Ref<string>} params.content - Nội dung Markdown đầy đủ (toàn bộ).
   * @param {import('vue').Ref<boolean>} params.isTypewriterActive - Trạng thái kích hoạt hiệu ứng gõ chữ.
   * @param {number} params.typewriterSpeed - Tốc độ gõ (ms mỗi ký tự).
   * @param {Function} [params.emit] - Hàm phát sự kiện (tuỳ chọn, dùng để thông báo hoàn tất).
   */
  constructor({
    displayedContentRef,
    typewriterTimeoutRef,
    currentIndexRef,
    previousContentRef,
    content,
    isTypewriterActive,
    typewriterSpeed = 20,
    emit = () => { }
  }) {
    this.displayedContentRef = displayedContentRef
    this.typewriterTimeoutRef = typewriterTimeoutRef
    this.currentIndexRef = currentIndexRef
    this.previousContentRef = previousContentRef
    this.content = content
    this.isTypewriterActive = isTypewriterActive
    this.typewriterSpeed = typewriterSpeed
    this.emit = emit
  }

  /**
   * Thiết lập các watcher để lắng nghe thay đổi của nội dung và trạng thái hiệu ứng.
   */
  setupWatchers() {
    // Khi nội dung Markdown thay đổi
    watch(
      this.content,
      (newContent, oldContent) => {
        this.processContentChange({ newContent, oldContent })
      },
      { immediate: true }
    )

    // Khi trạng thái hiệu ứng thay đổi (bật/tắt)
    watch(this.isTypewriterActive, newValue => {
      this.updateTypewriterState({ isActive: newValue })
    })
  }

  /**
   * Xử lý khi nội dung thay đổi (so sánh cũ và mới).
   *
   * @param {Object} params
   * @param {string} params.newContent - Nội dung mới.
   * @param {string} params.oldContent - Nội dung cũ.
   */
  processContentChange({ newContent, oldContent }) {
    if (!oldContent || !newContent.startsWith(oldContent)) {
      // Nếu nội dung thay đổi toàn bộ → reset lại hiệu ứng
      this.previousContentRef.value = newContent
      this.resetTypewriter()
      return
    }

    // Nếu chỉ có thêm nội dung mới (ví dụ đang stream text)
    if (newContent.length > oldContent.length && newContent.startsWith(oldContent)) {
      this.processAppendedContent({ newContent })
      return
    }

    // Ngược lại, reset lại
    this.previousContentRef.value = newContent
    this.resetTypewriter()
  }

  /**
   * Cập nhật trạng thái hiệu ứng gõ chữ.
   *
   * @param {{ isActive: boolean }} params
   */
  updateTypewriterState({ isActive }) {
    if (!isActive) {
      this.completeTypewriter()
      return
    }

    // Khi bật lại hiệu ứng mà chưa hiển thị hết nội dung
    if (this.currentIndexRef.value < this.content.value.length) {
      this.startTypewriter()
    }
  }

  /**
   * Xử lý khi có nội dung được thêm vào cuối.
   *
   * @param {{ newContent: string }} params
   */
  processAppendedContent({ newContent }) {
    this.previousContentRef.value = newContent

    // Nếu hiệu ứng đang hoạt động, tiếp tục gõ
    if (this.isTypewriterActive.value && this.currentIndexRef.value < newContent.length) {
      this.continueTypewriter()
      return
    }

    // Nếu tắt hiệu ứng → hiển thị toàn bộ
    this.displayedContentRef.value = newContent
    this.currentIndexRef.value = newContent.length
  }

  /**
   * Dừng hiệu ứng gõ chữ (xoá timeout).
   */
  stopTypewriter() {
    if (this.typewriterTimeoutRef.value) {
      clearTimeout(this.typewriterTimeoutRef.value)
      this.typewriterTimeoutRef.value = null
    }
  }

  /**
   * Bắt đầu hiệu ứng gõ chữ từ vị trí hiện tại.
   */
  startTypewriter() {
    if (!this.isTypewriterActive.value) {
      this.displayedContentRef.value = this.content.value
      this.currentIndexRef.value = this.content.value.length
      return
    }

    const typeNextCharacter = () => {
      const currentIndex = this.currentIndexRef.value
      if (currentIndex >= this.content.value.length) {
        this.emit('typewriterComplete')
        return
      }

      this.displayedContentRef.value = this.content.value.slice(0, currentIndex + 1)
      this.currentIndexRef.value = currentIndex + 1

      this.typewriterTimeoutRef.value = setTimeout(typeNextCharacter, this.typewriterSpeed)
    }

    typeNextCharacter()
  }

  /**
   * Tiếp tục hiệu ứng từ vị trí đang dừng.
   */
  continueTypewriter() {
    if (!this.isTypewriterActive.value) {
      this.displayedContentRef.value = this.content.value
      this.currentIndexRef.value = this.content.value.length
      return
    }

    this.startTypewriter()
  }

  /**
   * Đặt lại hiệu ứng về đầu (xoá nội dung và bắt đầu lại).
   */
  resetTypewriter() {
    this.stopTypewriter()
    this.displayedContentRef.value = ''
    this.currentIndexRef.value = 0

    nextTick(() => this.startTypewriter())
  }

  /**
   * Hiển thị ngay toàn bộ nội dung, không cần gõ từ từ.
   */
  completeTypewriter() {
    this.stopTypewriter()
    this.displayedContentRef.value = this.content.value
    this.currentIndexRef.value = this.content.value.length
    this.emit('typewriterComplete')
  }
}
