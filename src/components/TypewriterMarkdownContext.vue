<script>
import {
  defineComponent,
  ref,
} from 'vue'

import {
  MdPreview,
} from 'md-editor-v3'

import TypewriterMarkdownContext from '~/components/TypewriterMarkdownContext.js'

import 'md-editor-v3/lib/preview.css'

export default defineComponent({
  name: 'TypewriterMarkdown',

  components: {
    MdPreview,
  },

  props: {
    content: {
      type: String,
      required: true,
    },
    isTypewriterActive: {
      type: Boolean,
      default: false,
    },
    typewriterSpeed: {
      type: Number,
      default: 20,
    },
  },

  emits: Object.values(TypewriterMarkdownContext.EMIT_EVENT_NAME),

  setup (
    props,
    componentContext
  ) {
    const displayedContentRef = ref('')
    const typewriterTimeoutRef = ref(null)
    const currentIndexRef = ref(0)
    const previousContentRef = ref('')

    const args = {
      props,
      componentContext,
      displayedContentRef,
      typewriterTimeoutRef,
      currentIndexRef,
      previousContentRef,
    }

    const context = TypewriterMarkdownContext.create(args)
      .setupComponent()

    return {
      context,
    }
  },
})
</script>

<template>
  <div
    class="typewriter-markdown"
    @click="context.completeTypewriter()"
  >
    <MdPreview
      :model-value="context.displayedContent"
      language="en-US"
      preview-class="custom-editor"
      preview-theme="github"
      code-theme="github"
      theme="light"
      :auto-fold-threshold="100"
      auto-focus
    />
  </div>
</template>

<style scoped>
.typewriter-markdown:deep(.md-editor-preview) {
  word-break: normal;
}

.typewriter-markdown:deep(.md-editor-code-block) {
  letter-spacing: normal;
}
</style>
