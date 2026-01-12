<script>
import {
  defineComponent,
} from 'vue'

import Header from '@/components/Header.vue'
import DocView from '@/components/DocView.vue'

export default defineComponent({
  name: 'DefaultLayout',

  components: {
    Header,
    DocView,
  },
})
</script>

<template>
  <div class="layout">
    <Header />

    <div class="layout__content">
      <DocView />

      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
}

.layout__content {
  flex-grow: 1;
  display: flex;
  min-width: 0;
}

.layout__content .main {
  margin-inline-end: 1rem;
  margin-block-end: 1rem;

  padding: 1rem;
  border-radius: 1.5rem;

  flex-grow: 1;

  min-height: calc(95dvh - 6rem);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
