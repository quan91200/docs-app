<script setup>
import {
  computed
} from 'vue'

import {
  useRoute
} from 'vue-router'

import DefaultLayout from '@/layouts/default.vue'

const route = useRoute()

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
  <component :is="layout">
    <router-view />
  </component>
</template>
