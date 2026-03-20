import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const TOAST_DURATION = 5000
const FADE_DURATION  = 600

const ApiErrorContext = createContext(null)

let nextId = 0

const STYLES = {
  error: {
    border: 'border-red-200 dark:border-red-800',
    label: 'text-red-600 dark:text-red-400',
    icon: (
      <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  success: {
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
}

export function ApiErrorProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    // Start fade-out, then remove after animation completes
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, fading: true } : t))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), FADE_DURATION)
  }, [])

  const addToast = useCallback((message, type = 'error', label = '') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type, label, fading: false }])
    timers.current[id] = setTimeout(() => dismiss(id), TOAST_DURATION)
  }, [dismiss])

  const addSuccess = useCallback((message, label = 'Success') => {
    addToast(message, 'success', label)
  }, [addToast])

  useEffect(() => {
    function handleApiError(e) {
      addToast(e.detail.message, 'error', `Error ${e.detail.status}`)
    }
    window.addEventListener('api:error', handleApiError)
    return () => window.removeEventListener('api:error', handleApiError)
  }, [addToast])

  // Clear all timers on unmount
  useEffect(() => {
    return () => Object.values(timers.current).forEach(clearTimeout)
  }, [])

  return (
    <ApiErrorContext.Provider value={{ addToast, addSuccess }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const s = STYLES[toast.type] ?? STYLES.error
          return (
            <div
              key={toast.id}
              style={{ transition: `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease` }}
              className={`pointer-events-auto flex items-start gap-3 w-96 bg-white dark:bg-slate-800 border ${s.border} shadow-lg px-5 py-6 ${toast.fading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            >
              {s.icon}
              <div className="flex-1 min-w-0">
                {toast.label && (
                  <p className={`text-xs font-medium uppercase tracking-wider ${s.label}`}>
                    {toast.label}
                  </p>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300 font-light mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </ApiErrorContext.Provider>
  )
}

export function useApiError() {
  return useContext(ApiErrorContext)
}
