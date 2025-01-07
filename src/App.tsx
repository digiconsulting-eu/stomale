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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking initial session:", error);
          setIsError(true);
          return;
        }
        
        console.log("Initial session check:", session ? "Session found" : "No session");
        
        if (session) {
          try {
            const { data: adminData, error: adminError } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            if (adminError) {
              console.error("Error checking admin status:", adminError);
            } else {
              console.log("Admin check complete:", adminData?.length > 0 ? "Is admin" : "Not admin");
            }
          } catch (adminCheckError) {
            console.error("Error in admin status check:", adminCheckError);
          }
        }
      } catch (error) {
        console.error("Critical error during initialization:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Errore di caricamento</h1>
          <p className="text-gray-600">Si è verificato un errore durante il caricamento dell'applicazione.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
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