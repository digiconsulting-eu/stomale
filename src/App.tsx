
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
import { Button } from "./components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 10000, // Ridotto a 10 secondi per dati più aggiornati
      gcTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        console.log("Initializing app...");
        
        // Force refresh the session to ensure we have the latest state
        await supabase.auth.refreshSession();
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check failed:", sessionError);
          if (isMounted) {
            setIsError(true);
            setErrorMessage("Impossibile verificare la sessione. " + sessionError.message);
            toast.error("Errore durante l'inizializzazione dell'applicazione");
          }
          return;
        }

        console.log("Session check completed", session ? "User is logged in" : "No active session");

        // Then initialize auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session?.user?.email);
          if (event === 'SIGNED_IN' && isMounted) {
            console.log("User signed in, invalidating queries");
            queryClient.invalidateQueries();
          }
        });

        if (isMounted) {
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };

      } catch (error: any) {
        console.error("Critical initialization error:", error);
        if (isMounted) {
          setIsError(true);
          setErrorMessage(error.message || "Errore sconosciuto");
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
    }, 3000); // Reduced timeout to 3 seconds

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Rimosso isLoading dalle dipendenze per evitare cicli

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
          <p className="text-gray-600 mb-6">
            Si è verificato un errore durante il caricamento dell'applicazione.
            {errorMessage && (
              <span className="block mt-2 text-sm text-red-500">{errorMessage}</span>
            )}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Riprova
          </Button>
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
