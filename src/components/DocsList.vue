<script>
import {
  defineComponent,
} from 'vue'

import DocsListContext from '@/apps/contexts/DocsListContext'

export default defineComponent({
  name: 'DocsList',

  emits: [
    'create','rename', 'delete', 'select'
  ],

  setup(props, { emit }) {
    const context = DocsListContext.create({ emit })
      .setupComponent()

    return {
      context,
    }
  }
})
</script>

<template>
  <div class="docs-sidebar">
    <div class="sidebar-header">
      <h2>Documents</h2>
      <button class="btn-new" @click="context.handleCreate()" title="Tạo file mới">
        <span>+</span>
      </button>
    </div>

    <div v-if="context.docsStore.isLoading" class="loading">
      Đang tải...
    </div>

    <div v-else-if="!context.docsStore.hasDocuments" class="empty-state">
      <p>Chưa có document nào</p>
      <button class="btn-create" @click="context.handleCreate()">
        Tạo file đầu tiên
      </button>
    </div>

    <div v-else class="docs-list">
      <div
        v-for="doc in context.docsStore.docs"
        :key="doc.id"
        class="doc-item"
        :class="{ active: context.isActive(doc) }"
        @click="$emit('select', doc)"
      >
        <div class="doc-info">
          <div class="doc-name">{{ doc.filename }}</div>
          <div class="doc-meta">{{ context.formatDate(doc.updatedAt) }}</div>
        </div>

        <div class="doc-actions">
          <button
            class="btn-action"
            @click.stop="$emit('rename', doc)"
            title="Đổi tên"
          >
            ✏️
          </button>
          <button
            class="btn-action"
            @click.stop="$emit('delete', doc)"
            title="Xóa"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.btn-new {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-new:hover {
  background: #2563eb;
}

.loading,
.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
}

.btn-create {
  margin-top: 12px;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.btn-create:hover {
  background: #2563eb;
}

.docs-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  gap: 8px;
}

.doc-item:hover {
  background: #e5e7eb;
}

.doc-item.active {
  background: #dbeafe;
  border-left: 3px solid #3b82f6;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.doc-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.doc-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.doc-item:hover .doc-actions {
  opacity: 1;
}

.btn-action {
  outline: none;
  border: none;
  background: none;

  cursor: pointer;
  transition: ease-in-out 0.2s;
}

.btn-action:hover {
  scale: 1.5;
}
</style>
