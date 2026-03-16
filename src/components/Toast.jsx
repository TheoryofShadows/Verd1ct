import { createContext, useContext, useState, useCallback } from 'react'
import { C } from '../constants/colors'

const ToastCtx = createContext(null)

const TYPE_STYLE = {
  success: { bg: C.mS, border: C.mint,  color: C.mint  },
  error:   { bg: C.rS, border: C.red,   color: C.red   },
  info:    { bg: C.vG, border: C.vio,   color: C.vio   },
  warn:    { bg: C.aG, border: C.amb,   color: C.amb   },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}

      {/* Toast stack — above status bar (z-index 9000), bottom-right */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: 'fixed', bottom: 64, right: 20, zIndex: 9000,
          display: 'flex', flexDirection: 'column', gap: 8,
          pointerEvents: 'none', maxWidth: 340,
        }}
      >
        {toasts.map(t => {
          const s = TYPE_STYLE[t.type] || TYPE_STYLE.info
          return (
            <div
              key={t.id}
              role="alert"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 12,
                padding: '12px 16px',
                color: s.color,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.5,
                boxShadow: '0 8px 32px rgba(0,0,0,.45)',
                animation: 'fadeUp .3s cubic-bezier(.16,1,.3,1)',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{ background: 'none', border: 'none', color: s.color, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, opacity: .6, flexShrink: 0 }}
              >✕</button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

/** Call this anywhere inside <ToastProvider> to show a notification. */
export function useToast() {
  const fn = useContext(ToastCtx)
  if (!fn) throw new Error('useToast must be used within <ToastProvider>')
  return fn
}
