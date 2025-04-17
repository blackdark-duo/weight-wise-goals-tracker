
import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Create variants for different toast types
const toastVariants = cva(
  "fixed bottom-4 right-4 z-50 rounded-lg shadow-lg overflow-hidden transition-all duration-300 max-w-md transform translate-y-0 pointer-events-auto",
  {
    variants: {
      variant: {
        default: "bg-background border",
        info: "bg-blue-50 border-blue-100",
        success: "bg-green-50 border-green-100",
        warning: "bg-amber-50 border-amber-100",
        error: "bg-red-50 border-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Toast icon variants
const iconVariants = cva("mr-2 h-5 w-5", {
  variants: {
    variant: {
      default: "text-foreground",
      info: "text-blue-500",
      success: "text-green-500",
      warning: "text-amber-500",
      error: "text-red-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ImprovedToastProps extends VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}

export const ImprovedToast = React.forwardRef<
  HTMLDivElement,
  ImprovedToastProps
>(({
  title,
  description,
  icon,
  variant,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  className,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300); // Wait for transition to finish
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };
  
  const translateClass = isVisible 
    ? "translate-y-0 opacity-100" 
    : "translate-y-2 opacity-0";
  
  return (
    <div
      ref={ref}
      className={cn(
        toastVariants({ variant }),
        translateClass,
        className
      )}
      {...props}
    >
      <div className="flex p-4">
        {icon && (
          <div className={cn(iconVariants({ variant }))}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="ml-4 p-1 rounded-full hover:bg-muted self-start"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {autoClose && (
        <div
          className="h-1 bg-gradient-to-r from-blue-500 to-green-500"
          style={{
            width: "100%",
            animation: `shrink ${autoCloseDelay}ms linear forwards`,
          }}
        />
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
  );
});

ImprovedToast.displayName = "ImprovedToast";

// Toast manager component to handle multiple toasts
interface ToastManagerProps {
  children: React.ReactNode;
}

interface Toast extends ImprovedToastProps {
  id: string;
}

interface ToastContextType {
  addToast: (props: ImprovedToastProps) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<ToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  
  const addToast = (props: ImprovedToastProps) => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { ...props, id }]);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ImprovedToast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
