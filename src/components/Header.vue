<script>
import {
  defineComponent,
} from 'vue'

export default defineComponent({
  name: 'Header',
})
</script>

<template>
  <header class="header">
    <div class="header__logo">My Documents</div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem 2rem;
}

.header__logo {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
