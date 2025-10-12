<script>
import {
  defineComponent,
  ref,
} from 'vue'

import {
  MdEditor,
  NormalToolbar,
} from 'md-editor-v3'

import 'md-editor-v3/lib/style.css'
import 'markdown-it-github-alerts/styles/github-base.css'

import {
  MARK_DOWN_TOOLBARS,
} from '@/apps/constants'

import MarkDownEditorContext from '@/apps/contexts/MarkdownEditorContext'

/**
 * MarkdownInputEditor.vue
 *
 * Component nhập nội dung markdown, hỗ trợ xem trước (preview) và upload ảnh tuỳ chọn.
 * - Có thể truyền vào prop `uploadImageHandler` để tự định nghĩa upload ảnh.
 */
export default defineComponent({
  name: 'MarkdownInputEditor',

  components: {
    MdEditor,
    NormalToolbar,
  },

  props: {
    /** Giá trị nội dung markdown */
    modelValue: {
      type: String,
      default: '',
    },

    /** Nhãn hiển thị (label) */
    label: {
      type: String,
      default: '',
    },

    /** Placeholder hiển thị khi trống */
    placeholder: {
      type: String,
      default: 'Write your markdown here...',
    },

    /** Tên field (nếu cần submit form) */
    name: {
      type: String,
      default: '',
    },

    /** Style tuỳ biến của markdown editor */
    styleMarkdown: {
      /**
       * @type {import('vue').PropType<CSSProperties>}
       */
      type: Object,
      default: () => ({}),
    },

    /** Thông báo lỗi (nếu có) */
    errorMessage: {
      type: String,
      default: '',
    },

    /** Bật/tắt chế độ xem trực tiếp (live preview) */
    hasLivePreviewMode: {
      type: Boolean,
      default: false,
    },

    /**
     * Hàm upload ảnh tuỳ chọn (async)
     * @example
     * async uploadImageHandler(file) {
     *   const fd = new FormData()
     *   fd.append('image', file)
     *   const res = await fetch('/api/upload', { method: 'POST', body: fd })
     *   const body = await res.json()
     *   return body.url
     * }
     */
    uploadImageHandler: {
      type: Function,
      required: false,
      default: undefined,
    },
  },

  setup (props, componentContext) {
    // Nội dung markdown
    const contentRef = ref(props.modelValue)

    // Ref tới instance editor
    const editorRef = ref(null)

    // Trạng thái viết / xem trước
    const isWriteModeRef = ref(true)

    // Danh sách toolbar
    const toolbarsRef = ref(MARK_DOWN_TOOLBARS)
  
    /**
     * Upload ảnh cho markdown editor
     * @param {Object} param
     * @param {File[]} param.files - danh sách file ảnh
     * @param {Function} param.markdownV3EditorCallback - callback chèn ảnh sau khi upload
     */
    async function uploadImageHandlerForContext ({ files, markdownV3EditorCallback }) {
      if (!files?.length) return
      const urls = []

      for (const file of files) {
        try {
          if (typeof props.uploadImageHandler === 'function') {
            // Gọi hàm upload của người dùng (nếu có)
            const url = await props.uploadImageHandler(file)
            if (url) urls.push(url)
          } else {
            // Fallback: dùng URL tạm thời (chỉ hiển thị, không lưu)
            const url = URL.createObjectURL(file)
            urls.push(url)
          }
        } catch (err) {
          console.error(`Lỗi upload ảnh ${file.name}:`, err)
        }
      }

      if (urls.length) await markdownV3EditorCallback(urls)
    }

    // Tạo context Markdown (phiên bản không GraphQL)
    const context = MarkDownEditorContext.create({
      props,
      componentContext,
      contentRef,
      toolbarsRef,
      editorRef,
      isWriteModeRef,
    }).setupComponent()

    // Gắn upload handler vào context
    context.uploadImage = uploadImageHandlerForContext

    return {
      context,
      contentRef,
      editorRef,
    }
  },
})
</script>

<template>
  <div class="unit-markdown-editor">
    <!-- Label -->
    <label v-if="context.markdownLabel" class="label">
      {{ context.markdownLabel }}
    </label>

    <!-- Hidden input (nếu cần submit form) -->
    <input
      v-model="contentRef"
      type="hidden"
      :name="context.markdownInputName"
      :value="contentRef"
    >

    <!-- Editor -->
    <MdEditor
      ref="editorRef"
      v-model="contentRef"
      :toolbars="context.getToolbarsConfig()"
      :class="context.generateMdEditorClasses()"
      language="en-US"
      :style="context.getStyleMdEditor"
      editor-class="custom-editor"
      :preview="context.isLivePreviewMode"
      :placeholder="context.markdownPlaceholder"
      preview-theme="github"
      code-theme="github"
      theme="light"
      :auto-fold-threshold="100"
      auto-focus
      @on-upload-img="(files, callback) => context.uploadImage({ files, markdownV3EditorCallback: callback })"
    >
      <!-- Toolbar chuyển Write/Preview -->
      <template #defToolbars>
        <NormalToolbar class="toggle-mode">
          <template #trigger>
            <div class="markdown-tabs-toolbar">
              <button
                type="button"
                class="button"
                :class="context.generateButtonWriteClasses()"
                @click="context.toggleModeEditor()"
              >
                Write
              </button>
              <button
                type="button"
                class="button"
                :class="context.generateButtonPreviewClasses()"
                @click="context.toggleModeEditor()"
              >
                Preview
              </button>
            </div>
          </template>
        </NormalToolbar>
      </template>
    </MdEditor>

    <!-- Lỗi -->
    <span class="message error">{{ context.errorMessage }}</span>
  </div>
</template>

<style scoped>
.unit-markdown-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: 0.5rem;
}

.unit-markdown-editor .md-editor {
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}

.unit-markdown-editor .label {
  font-size: 0.9rem;
  font-weight: 500;
}

.unit-markdown-editor .markdown-tabs-toolbar {
  display: flex;
  gap: 0.3rem;
  background-color: #f8f8f8;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.markdown-tabs-toolbar .button {
  border: none;
  background: none;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 0.3rem;
  transition: 0.2s;
}

.markdown-tabs-toolbar .button.active {
  background-color: #fff;
  box-shadow: 0 0 2px #999;
}

.message.error {
  font-size: 0.8rem;
  color: #d9534f;
}
</style>
