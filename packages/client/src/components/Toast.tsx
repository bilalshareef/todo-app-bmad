interface ToastProps {
  message: string | null
  visible: boolean
  exiting: boolean
}

export function Toast({ message, visible, exiting }: ToastProps) {
  if (!visible) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 flex max-w-[360px] items-center gap-3 rounded-lg bg-toast-dark px-5 py-[14px] text-sm font-medium text-white shadow-lg ${
        exiting ? 'animate-toast-fade-out' : 'animate-toast-slide-in'
      }`}
    >
      <span className="shrink-0 text-error-red">⚠️</span>
      <span>{message}</span>
    </div>
  )
}
