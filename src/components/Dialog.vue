<script setup>
import DialogContext from '@/apps/contexts/DialogContext'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentFilename: {
    type: String,
    default: ''
  },
  docId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'rename'])

const context = new DialogContext(emit)
context.setupComponent(props)
</script>

<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    @click.self="context.close"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          {{ context.isNewDoc
              ? 'Lưu file mới'
              : 'Đổi tên file'
          }}
        </h3>
        <button class="btn-close" @click="context.close()">
          ×
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="filename">Tên file:</label>
          <div class="input-wrapper">
            <input
              id="filename"
              v-model="context.filename"
              type="text"
              placeholder="Nhập tên file..."
              @keyup.enter="context.save()"
              ref="context.inputRef"
            />
            <span class="extension">.md</span>
          </div>
          <p
            v-if="context.errorMsg"
            class="error-msg"
          >
            {{ context.errorMsg }}
          </p>
          <p class="hint">Tên file không được để trống và không trùng với file khác</p>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-cancel"
          @click="context.close()"
        >
          Hủy
        </button>

        <button
          class="btn btn-primary"
          @click="context.save()"
          :disabled="!context.filename"
        >
          {{ context.isNewDoc ? 'Lưu' : 'Đổi tên' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #3b82f6;
}

.input-wrapper input {
  flex: 1;
  border: none;
  padding: 10px 12px;
  font-size: 1rem;
  outline: none;
}

.extension {
  padding: 10px 12px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 500;
  user-select: none;
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 8px;
  margin-bottom: 0;
}

.hint {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 8px;
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
