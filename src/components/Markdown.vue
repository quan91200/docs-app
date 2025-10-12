<script>
import {
  defineComponent,
} from 'vue'

import {
  MdPreview,
} from 'md-editor-v3'

import 'md-editor-v3/lib/preview.css'

import Markdown from '@/apps/contexts/Markdown'

export default defineComponent({
  name: 'Markdown',

  components: {
    MdPreview,
  },

  props: {
    content: {
      type: String,
      required: true,
    },
  },

  setup (
    props,
    componentContext
  ) {
    const context = Markdown.create({
      props,
      componentContext,
    })
      .setupComponent()

    return {
      context,
    }
  },
})
</script>

<template>
  <MdPreview
    :model-value="context.markdownContent"
    language="en-US"
    preview-class="custom-editor"
    preview-theme="github"
    code-theme="github"
    theme="light"
    :auto-fold-threshold="100"
    auto-focus
  />
</template>

<style scoped>
:deep(.md-editor-preview) {
  word-break: normal;
}

:deep(.md-editor-code-block) {
  letter-spacing: normal;
}
</style>
