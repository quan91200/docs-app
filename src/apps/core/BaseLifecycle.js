import {
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  onUpdated,
} from 'vue'

export default class BaseLifecycle {
  /**
   * Constructor.
   */
  constructor(context) {
    this.context = context
  }

  /**
   * Hook onMounted
   *
   * @param {Function} callback
   */
  onMounted(callback) {
    onMounted(
      () => callback?.call(this.context)
    )
  }

  /**
   * Hook onUpdated
   *
   * @param {Function} callback
   */
  onUpdated(callback) {
    onUpdated(
      () => callback?.call(this.context)
    )
  }

  /**
   * Hook onUnmounted
   *
   * @param {Function} callback
   */
  onUnmounted(callback) {
    onUnmounted(() => callback?.call(this.context))
  }

  /**
   * Hook onBeforeUnmount
   *
   * @param {Function} callback
   */
  onBeforeUnmount(callback) {
    onBeforeUnmount(() => callback?.call(this.context))
  }

  /**
   * Invoke request onMounted
   */
  async invokeRequestOnMounted(requestFn, args) {
    this.onMounted(async () => {
      await requestFn?.(args)
    })
  }

  /**
   * Invoke request onEvent
   */
  async invokeRequestOnEvent(requestFn, args) {
    await requestFn?.(args)
  }
}
