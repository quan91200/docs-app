<script setup>
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
} from 'vue'

import {
  useRoute
} from 'vue-router'

import DefaultLayout from '@/layouts/default.vue'

const route = useRoute()
const isDesktop = ref(true)

function checkScreenSize() {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const layout = computed(() => {
  switch (route.meta.layout) {
    case 'DefaultLayout':
      return DefaultLayout
    default:
      return DefaultLayout
  }
})
</script>

<template>
  <div v-if="isDesktop">
    <component :is="layout">
      <router-view />
    </component>
  </div>
  <div v-else class="mobile-blocker">
    <div class="message-box">
      <h1>Desktop Only</h1>
      <p>Ứng dụng này chỉ hỗ trợ trên màn hình Desktop (>= 1024px).</p>
      <p>Vui lòng mở trên máy tính để sử dụng.</p>
    </div>
  </div>
</template>

<style>
.mobile-blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--color-bg-base, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  text-align: center;
  padding: 20px;
}

.message-box h1 {
  font-size: 2rem;
  color: var(--color-primary, #3b82f6);
  margin-bottom: 1rem;
}

.message-box p {
  color: var(--color-text-main, #334155);
  font-size: 1.1rem;
}
</style>
