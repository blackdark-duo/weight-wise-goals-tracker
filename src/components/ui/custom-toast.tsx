
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { Toaster as ToastProvider } from "@/components/ui/toast";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createContext, useState, useEffect, useContext } from "react";

interface CustomToast {
  id: string;
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "error";
}

interface CustomToastContextType {
  toasts: CustomToast[];
  addToast: (toast: Omit<CustomToast, "id">) => void;
  removeToast: (id: string) => void;
}

const CustomToastContext = createContext<CustomToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const useCustomToast = () => useContext(CustomToastContext);

export function CustomToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<CustomToast[]>([]);

  const addToast = (toast: Omit<CustomToast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Auto remove toasts after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) => {
        if (prev.length === 0) return prev;
        return prev.slice(1);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <CustomToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastProvider>
        {toasts.map((toast) => (
          <Toast key={toast.id} className="top-0 right-0 fixed min-w-0 md:min-w-[420px]">
            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <ToastTitle className={toast.type === "error" ? "text-destructive" : toast.type === "warning" ? "text-amber-500" : toast.type === "success" ? "text-green-500" : ""}>
                  {toast.title}
                </ToastTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => removeToast(toast.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
          </Toast>
        ))}
      </ToastProvider>
    </CustomToastContext.Provider>
  );
}
