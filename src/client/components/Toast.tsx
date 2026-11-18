import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-coquette-lg border text-sm font-medium transition-all animate-bounce-subtle ${
              toast.type === 'success'
                ? 'bg-white border-[#5E8B34]/30 text-coquette-brown'
                : toast.type === 'error'
                ? 'bg-white border-coquette-rose/50 text-coquette-roseDark'
                : 'bg-white border-coquette-priceBorder text-coquette-brown'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {toast.type === 'success' && <CheckCircle2 size={18} className="text-[#5E8B34] flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={18} className="text-coquette-rose flex-shrink-0" />}
              {toast.type === 'info' && <Info size={18} className="text-[#78B6F0] flex-shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-coquette-brownMuted hover:text-coquette-brown"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
