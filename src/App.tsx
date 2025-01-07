import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import { CookieConsent } from "./components/CookieConsent";
import { AppRoutes } from "./components/AppRoutes";
import { AuthStateHandler } from "./components/auth/AuthStateHandler";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthModal } from "./components/auth/AuthModal";
import { useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Simple initialization check
  useState(() => {
    const checkSession = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check failed:", error);
          setIsError(true);
          toast.error("Errore durante l'inizializzazione dell'applicazione");
        }
      } catch (error) {
        console.error("Critical initialization error:", error);
        setIsError(true);
        toast.error("Errore critico durante l'inizializzazione");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Fallback timeout to ensure we don't get stuck loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-600">Caricamento in corso...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-white">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Errore di caricamento</h1>
          <p className="text-gray-600 mb-6">Si è verificato un errore durante il caricamento dell'applicazione.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthStateHandler />
          <AuthModal />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
            <CookieConsent />
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;