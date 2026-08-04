"use client";

import { createContext, useContext, useState, useCallback, useId } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "hsl(160 84% 39% / 0.12)", border: "hsl(160 84% 39% / 0.35)", icon: "hsl(160 84% 39%)" },
  error:   { bg: "hsl(0 72% 51% / 0.12)",   border: "hsl(0 72% 51% / 0.35)",   icon: "hsl(0 72% 51%)" },
  warning: { bg: "hsl(38 92% 50% / 0.12)",  border: "hsl(38 92% 50% / 0.35)",  icon: "hsl(38 92% 50%)" },
  info:    { bg: "hsl(217 91% 60% / 0.12)", border: "hsl(217 91% 60% / 0.35)", icon: "hsl(217 91% 60%)" },
};

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...opts, id }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: "error",   title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: "info",    title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map(t => {
          const Icon = icons[t.type];
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              className="animate-fade-in"
              style={{
                background: "hsl(var(--bg-surface))",
                border: `1px solid ${c.border}`,
                borderLeft: `3px solid ${c.icon}`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                minWidth: 280,
                maxWidth: 380,
                boxShadow: "0 8px 32px -8px hsl(0 0% 0% / 0.4)",
                pointerEvents: "all",
              }}
            >
              <Icon size={16} color={c.icon} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>{t.title}</div>
                {t.message && <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>{t.message}</div>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "hsl(var(--text-muted))", flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
