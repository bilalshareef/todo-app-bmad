import { useState, useRef, useEffect, useCallback } from 'react'

interface ToastState {
  message: string | null
  visible: boolean
  exiting: boolean
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: null,
    visible: false,
    exiting: false,
  })

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
    if (exitTimerRef.current !== null) {
      clearTimeout(exitTimerRef.current)
      exitTimerRef.current = null
    }
  }, [])

  const hideToast = useCallback(() => {
    clearTimers()
    setToast({ message: null, visible: false, exiting: false })
  }, [clearTimers])

  const showToast = useCallback(
    (message: string) => {
      clearTimers()
      setToast({ message, visible: true, exiting: false })

      dismissTimerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, exiting: true }))
        exitTimerRef.current = setTimeout(() => {
          setToast({ message: null, visible: false, exiting: false })
        }, 300)
      }, 4000)
    },
    [clearTimers],
  )

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return { toast, showToast, hideToast }
}
