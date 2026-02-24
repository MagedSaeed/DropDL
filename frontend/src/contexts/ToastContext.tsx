import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: Toast['type'], message: string) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium
            animate-[slideIn_0.2s_ease-out]
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200' : ''}
          `}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
