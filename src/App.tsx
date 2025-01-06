import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import { CookieConsent } from "./components/CookieConsent";
import { AppRoutes } from "./components/AppRoutes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./components/ui/button";
import { toast } from "sonner";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async (email: string) => {
      try {
        console.log('Checking admin status for:', email);
        const { data: adminData, error } = await supabase
          .from('admin')
          .select('email')
          .eq('email', email);
        
        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }
        
        const isAdmin = Array.isArray(adminData) && adminData.length > 0;
        console.log('Is admin?', isAdmin);
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        return isAdmin;
      } catch (error) {
        console.error('Error in checkAdminStatus:', error);
        return false;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN') {
        try {
          localStorage.setItem('isLoggedIn', 'true');
          if (session?.user?.email) {
            const isAdmin = await checkAdminStatus(session.user.email);
            
            // Only redirect if we're on the login page
            if (location.pathname === '/login') {
              navigate(isAdmin ? '/admin' : '/dashboard');
              toast.success('Accesso effettuato con successo');
            }
          }
        } catch (error) {
          console.error('Error handling sign in:', error);
          toast.error('Errore durante l\'accesso');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Cleaning up auth state...');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        const protectedRoutes = ['/dashboard', '/admin'];
        if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
          navigate('/');
          toast.success('Logout effettuato con successo');
        }
      }
    });

    // Check initial auth state
    const checkInitialAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session?.user?.email) {
          localStorage.setItem('isLoggedIn', 'true');
          await checkAdminStatus(session.user.email);
        } else {
          console.log('No active session found, cleaning up...');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
        }
      } catch (error) {
        console.error('Error in checkInitialAuth:', error);
      }
    };

    checkInitialAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  return null;
};

const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const timer = setTimeout(() => {
          // Don't show modal on login or register pages
          if (!['/login', '/registrati'].includes(location.pathname)) {
            setIsOpen(true);
          }
        }, 90000); // 90 seconds
        return () => clearTimeout(timer);
      } else {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin')
          .select('email')
          .eq('email', session.user.email);
        
        // If user is not admin and not on protected pages, show modal
        if (!adminData?.length && !['/login', '/registrati', '/admin', '/dashboard'].includes(location.pathname)) {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 90000);
          return () => clearTimeout(timer);
        }
      }
    };

    checkAuthStatus();
  }, [location.pathname]);

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const handleRegister = () => {
    setIsOpen(false);
    navigate('/registrati');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Accedi per continuare</DialogTitle>
          <DialogDescription className="text-center pt-4">
            Per continuare a navigare su StoMale.info è necessario effettuare l'accesso o registrarsi.
            La registrazione è gratuita e ti permette di accedere a tutte le funzionalità del sito.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button onClick={handleLogin} variant="outline" className="flex-1">
            Accedi
          </Button>
          <Button onClick={handleRegister} className="flex-1">
            Registrati
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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

const App = () => (
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

export default App;