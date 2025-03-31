
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
import { useState, useEffect } from "react";
import { supabase, checkClientHealth, resetSupabaseClient } from "./integrations/supabase/client";
import { toast } from "sonner";
import { SessionMonitor } from "./components/auth/SessionMonitor";

// Configure the query client with more aggressive retry settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        console.log("Initializing app...");
        
        // Initialize with a health check
        const isHealthy = await checkClientHealth();
        
        if (!isHealthy) {
          console.log("Client health check failed, attempting reset");
          await resetSupabaseClient();
        }
        
        // Get the current session (potentially refreshed)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check failed:", sessionError);
          if (isMounted) {
            setIsError(true);
            toast.error("Errore durante l'inizializzazione dell'applicazione");
          }
          return;
        }

        console.log("Session check completed", session ? session.user?.email : 'No active session');

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Critical initialization error:", error);
        if (isMounted) {
          setIsError(true);
          toast.error("Errore critico durante l'inizializzazione");
        }
      }
    };

    // Start initialization
    initializeApp();

    // Set a backup timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Initialization timeout reached");
        setIsLoading(false);
      }
    }, 5000); // Reduced timeout to 5 seconds for better UX

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
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
          <SessionMonitor />
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
