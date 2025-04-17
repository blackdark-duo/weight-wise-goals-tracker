
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed flex items-start gap-2 p-4 rounded-lg shadow-lg transition-all duration-300 animate-enter",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200",
        success: "bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-l-emerald-500 text-emerald-800",
        error: "bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-l-rose-500 text-rose-800",
        warning: "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-l-amber-500 text-amber-800",
        info: "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 text-blue-800",
      },
      position: {
        topRight: "top-4 right-4",
        topLeft: "top-4 left-4",
        bottomRight: "bottom-4 right-4", 
        bottomLeft: "bottom-4 left-4",
        topCenter: "top-4 left-1/2 -translate-x-1/2",
        bottomCenter: "bottom-4 left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "topRight",
    },
  }
);

const iconMap = {
  success: CheckCircle,
  error: X,
  warning: AlertTriangle,
  info: Info,
  default: Info,
};

export interface ToastNotificationProps extends VariantProps<typeof toastVariants> {
  title: string;
  message?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  position?: "topRight" | "topLeft" | "bottomRight" | "bottomLeft" | "topCenter" | "bottomCenter";
  onClose?: () => void;
  duration?: number;
  className?: string;
}

export const ToastNotification = React.forwardRef<HTMLDivElement, ToastNotificationProps>(
  ({ title, message, variant = "default", position = "topRight", onClose, duration = 5000, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    
    React.useEffect(() => {
      if (duration) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 300);
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);
    
    const Icon = iconMap[variant || "default"];
    
    return isVisible ? (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant, position }),
          isVisible ? "opacity-100" : "opacity-0 translate-y-2",
          className
        )}
        {...props}
      >
        <div className="shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          {message && <p className="text-xs opacity-90 mt-1">{message}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onClose?.();
            }, 300);
          }}
          className="shrink-0 rounded-full p-1 hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20">
            <div 
              className="h-full bg-current opacity-80"
              style={{ 
                width: "100%", 
                animation: `shrink ${duration}ms linear forwards` 
              }}
            />
          </div>
        )}
        
        <style>
          {`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}
        </style>
      </div>
    ) : null;
  }
);

ToastNotification.displayName = "ToastNotification";

// Toast Manager
type Toast = ToastNotificationProps & { id: string };

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<ToastNotificationProps, "onClose">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  
  const addToast = React.useCallback((toast: Omit<ToastNotificationProps, "onClose">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);
  
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  
  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToasts = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts must be used within a ToastProvider");
  }
  return context;
};
