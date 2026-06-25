import { create } from 'zustand'

let toastId = 0

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = ++toastId
    const newToast = { ...toast, id }
    set((state) => ({ toasts: [...state.toasts, newToast] }))
    const duration = toast.duration || 4000
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
    return id
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  confirm: (message) => {
    return new Promise((resolve) => {
      get().addToast({
        type: 'confirm',
        message,
        duration: 0,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  },
}))

export function toast() {
  return {
    success: (message, opts) =>
      useToastStore.getState().addToast({ type: 'success', message, ...opts }),
    error: (message, opts) =>
      useToastStore.getState().addToast({ type: 'error', message, ...opts }),
    warning: (message, opts) =>
      useToastStore.getState().addToast({ type: 'warning', message, ...opts }),
    info: (message, opts) =>
      useToastStore.getState().addToast({ type: 'info', message, ...opts }),
    confirm: (message) => useToastStore.getState().confirm(message),
  }
}

export default useToastStore
