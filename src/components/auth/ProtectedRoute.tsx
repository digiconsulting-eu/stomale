
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkIsAdmin } from "@/utils/auth/adminUtils";
import { checkSessionHealth } from "@/utils/auth/sessionUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('ProtectedRoute: Checking authentication for path:', window.location.pathname);
        console.log('AdminOnly requirement:', adminOnly);
        
        // First check localStorage for faster response
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
        
        // Promise with a timeout to prevent blocking
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{data: {session: null}}>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 3000);
        });
        
        // Use Promise.race to ensure we don't block for too long
        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        const session = data.session;
        
        if (!session) {
          console.log('ProtectedRoute: No session found, redirecting to login');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          
          toast.error("Accesso negato", {
            description: "Devi effettuare l'accesso per visualizzare questa pagina"
          });
          navigate('/login', { replace: true });
          return;
        }

        // User is authenticated, now check admin status if required
        if (adminOnly) {
          // First check localStorage for faster response
          if (storedIsAdmin) {
            console.log('ProtectedRoute: User is admin according to localStorage');
            setIsAuthenticated(true);
            setIsLoading(false);
            localStorage.setItem('isLoggedIn', 'true');
            return;
          }
          
          // Double-check with the database
          const isAdmin = await checkIsAdmin(session.user.email || '');
          
          if (!isAdmin) {
            console.log('ProtectedRoute: User is not admin, redirecting to dashboard');
            toast.error("Accesso negato", {
              description: "Non hai i permessi necessari per accedere a questa pagina"
            });
            navigate('/dashboard', { replace: true });
            return;
          }
          
          // Update localStorage with verified admin status
          localStorage.setItem('isAdmin', 'true');
        }

        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', session.user.email || '');
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        navigate('/login', { replace: true });
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, adminOnly]);

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Caricamento...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};
