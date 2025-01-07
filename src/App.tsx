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
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Starting initialization attempt:", initializationAttempts + 1);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking initial session:", error);
          if (initializationAttempts < 3) {
            setInitializationAttempts(prev => prev + 1);
            return;
          }
          setIsError(true);
          toast.error("Errore durante l'inizializzazione dell'applicazione");
          return;
        }
        
        console.log("Initial session check:", session ? "Session found" : "No session");
        
        if (session) {
          try {
            const { data: adminData, error: adminError } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email)
              .single();
            
            if (adminError && adminError.code !== 'PGRST116') {
              console.error("Error checking admin status:", adminError);
              toast.error("Errore durante la verifica dei permessi");
            } else {
              console.log("Admin check complete:", adminData ? "Is admin" : "Not admin");
            }
          } catch (adminCheckError) {
            console.error("Error in admin status check:", adminCheckError);
          }
        }
      } catch (error) {
        console.error("Critical error during initialization:", error);
        if (initializationAttempts < 3) {
          setInitializationAttempts(prev => prev + 1);
          return;
        }
        setIsError(true);
        toast.error("Errore critico durante l'inizializzazione");
      } finally {
        if (initializationAttempts >= 2 || !isError) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (isLoading && initializationAttempts < 3) {
        console.log("Initialization timeout, retrying...");
        initializeAuth();
      } else if (isLoading) {
        setIsLoading(false);
        setIsError(true);
        toast.error("Timeout durante l'inizializzazione dell'applicazione");
      }
    }, 5000);

    initializeAuth();

    return () => clearTimeout(timeoutId);
  }, [initializationAttempts, isError]);

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