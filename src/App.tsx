
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/auth";
import AppRoutes from "./components/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import { CustomToastProvider } from "./components/ui/custom-toast";
import ErrorBoundary from "./components/ErrorBoundary";

// Set application name
const APP_NAME = "WeightWise";

// Create a client with stale time to prevent unnecessary refetches
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes to prevent frequent refetches
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Set document title
  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CustomToastProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" expand={false} closeButton richColors />
            <AuthProvider>
              <BrowserRouter>
                <ScrollToTop />
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </CustomToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
