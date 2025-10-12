<script>
import {
  defineComponent,
} from 'vue'

import MarkdownInputEditor from '@/components/MarkdownInputEditor.vue'

export default defineComponent({
  name: 'Home',

  components: {
    MarkdownInputEditor,
  },
})
</script>

<template>
  <MarkdownInputEditor
    label="Content"
    :has-live-preview-mode="true"
  />
</template>
