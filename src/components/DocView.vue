<script setup>
import {
  ref,
} from 'vue'

import DocsList from './DocsList.vue'

import Dialog from '@/components/Dialog.vue'

import {
  useDocsStore,
} from '@/stores/docs.store'

const docsStore = useDocsStore()

const isDialogOpen = ref(false)
const currentFilename = ref('')
const currentDocId = ref(null)

function openCreateDialog() {
  currentFilename.value = ''
  currentDocId.value = null
  isDialogOpen.value = true
}

function openRenameDialog(doc) {
  currentFilename.value = doc.filename
  currentDocId.value = doc.id
  isDialogOpen.value = true
}

async function handleSave(filename) {
  const newDoc = await docsStore.createNew(filename)
  docsStore.setCurrentDoc(newDoc)
  isDialogOpen.value = false
}

async function handleRenameSubmit(filename) {
  await docsStore.rename(currentDocId.value, filename)
  isDialogOpen.value = false
}

async function handleDelete(doc) {
  if (confirm(`Xóa "${doc.filename}"?`)) {
    await docsStore.remove(doc.id)
  }
}

function handleSelect(doc) {
  docsStore.setCurrentDoc(doc)
}
</script>

<template>
  <div class="docs-view">
    <DocsList
      @create="openCreateDialog"
      @rename="openRenameDialog"
      @delete="handleDelete"
      @select="handleSelect"
    />

    <Dialog
      v-if="isDialogOpen"
      :is-open="isDialogOpen"
      :current-filename="currentFilename"
      :doc-id="currentDocId"
      @close="isDialogOpen = false"
      @save="handleSave"
      @rename="handleRenameSubmit"
    />
  </div>
</template>
