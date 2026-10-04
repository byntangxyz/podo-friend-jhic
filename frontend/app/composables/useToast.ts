export const useToast = () => {
  const isVisible = useState<boolean>('toast_visible', () => false)
  const message = useState<string>('toast_message', () => '')
  const timer = useState<ReturnType<typeof setTimeout> | null>('toast_timer', () => null)

  const showToast = (msg: string, duration = 3500) => {
    message.value = msg
    isVisible.value = true

    if (timer.value) {
      clearTimeout(timer.value)
    }

    timer.value = setTimeout(() => {
      isVisible.value = false
      timer.value = null
    }, duration)
  }

  const hideToast = () => {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    isVisible.value = false
  }

  return {
    isVisible,
    message,
    showToast,
    hideToast,
  }
}
