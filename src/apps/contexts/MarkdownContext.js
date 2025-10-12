import {
  computed,
  watch,
  nextTick,
} from 'vue'

import {
  convertProcessContent,
  generateTextAtSelection,
  BULLET_MATCH_REGEX,
  NUMBER_MATCH_REGEX,
} from '@/utils/markdown.helper.js'

/**
 * Lớp điều khiển trình soạn thảo Markdown
 *
 * - Tập trung xử lý logic Markdown và hành vi editor
 */
export default class MarkdownContext {
  /**
   * @param {{
   *  props: object,
   *  contentRef: import('vue').Ref<string>,
   *  activeTabRef: import('vue').Ref<'write'|'preview'>,
   *  textareaElementRef: import('vue').Ref<HTMLTextAreaElement>,
   * }} params
   */
  constructor({
    props,
    contentRef,
    activeTabRef,
    textareaElementRef,
  }) {
    this.props = props
    this.contentRef = contentRef
    this.activeTabRef = activeTabRef
    this.textareaElementRef = textareaElementRef

    // computed: nội dung preview (HTML)
    this.previewContentComputed = computed(() => {
      if (this.activeTabRef.value !== 'preview') return ''
      if (!this.contentRef.value) return 'Nothing to preview'
      return convertProcessContent(this.contentRef.value)
    })
  }

  /**
   * Khởi tạo watcher để đồng bộ v-model
   */
  setup() {
    watch(() => this.props.modelValue, newValue => {
      if (newValue !== this.contentRef.value)
        this.contentRef.value = newValue || ''
    })
  }

  /**
   * Danh sách các hành động toolbar
   */
  get toolbarActions() {
    return [
      {
        icon: 'ph:text-h-bold',
        action: () => this.insertMarkdown('### ', '', 'Tiêu đề'),
        tooltip: 'Tiêu đề',
      },
      {
        icon: 'ph:list-bullets',
        action: () => this.insertItems('- '),
        tooltip: 'Danh sách bullet',
      },
      {
        icon: 'ph:number-circle-one',
        action: () => this.insertItems('1. '),
        tooltip: 'Danh sách số',
      },
      {
        icon: 'ph:code',
        action: () => this.insertCodeBlock(),
        tooltip: 'Code block',
      },
    ]
  }

  // === Các hành động chính ===

  changeTabMode(mode) {
    this.activeTabRef.value = mode
  }

  insertMarkdown(prefix, suffix = '', placeholder = '') {
    const textarea = this.textareaElementRef.value
    if (!textarea) return

    const { selectionStart, selectionEnd, value } = textarea
    const selected = value.slice(selectionStart, selectionEnd)
    const insertText = selected || placeholder

    const newValue = generateTextAtSelection({
      currentContent: value,
      insertedText: `${prefix}${insertText}${suffix}`,
      selectionStart,
      selectionEnd,
    })

    this.updateContent(newValue)
    nextTick(() => {
      const pos = selectionStart + prefix.length + insertText.length + suffix.length
      textarea.setSelectionRange(pos, pos)
      textarea.focus()
    })
  }

  insertItems(prefix) {
    const textarea = this.textareaElementRef.value
    if (!textarea) return

    const { selectionStart, selectionEnd, value } = textarea
    const selectedText = value.slice(selectionStart, selectionEnd)
    const lines = selectedText.split('\n')
    const updated = lines.map(line => (line.trim() ? prefix + line : prefix)).join('\n')

    const newValue = generateTextAtSelection({
      currentContent: value,
      insertedText: updated,
      selectionStart,
      selectionEnd,
    })
    this.updateContent(newValue)
  }

  insertCodeBlock() {
    this.insertMarkdown('\n```javascript\n', '\n```\n')
  }

  /**
   * Khi người dùng nhấn Enter sau bullet/number list → tự thêm dòng tiếp
   */
  handleInput(event) {
    if (event.inputType === 'insertLineBreak') {
      const textarea = event.target
      const { selectionStart, value } = textarea
      const beforeCursor = value.slice(0, selectionStart)
      const lastLine = beforeCursor.split('\n').pop()

      if (BULLET_MATCH_REGEX.test(lastLine)) {
        event.preventDefault()

        const bullet = lastLine.match(BULLET_MATCH_REGEX)[1]

        this.insertMarkdown('\n' + bullet, '')
      } else if (NUMBER_MATCH_REGEX.test(lastLine)) {
        event.preventDefault()

        const [, num] = lastLine.match(NUMBER_MATCH_REGEX)

        this.insertMarkdown(`\n${parseInt(num, 10) + 1}. `, '')
      }
    }
  }

  /**
   * Cập nhật nội dung và emit sự kiện
   */
  updateContent(newValue) {
    this.contentRef.value = newValue
    if (this.props?.onUpdateModelValue) {
      this.props.onUpdateModelValue(newValue)
    }
  }
}
