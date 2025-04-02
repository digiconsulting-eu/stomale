
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkIsAdmin } from "@/utils/auth/adminUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
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
        
        // Then validate with actual session check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('ProtectedRoute: No session found, redirecting to login');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          
          toast.error("Accesso negato", {
            description: "Devi effettuare l'accesso per visualizzare questa pagina"
          });
          navigate('/login');
          return;
        }

        // User is authenticated, now check admin status if required
        if (adminOnly) {
          // First check localStorage for faster response
          if (storedIsAdmin) {
            console.log('ProtectedRoute: User is admin according to localStorage');
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
          
          // Double-check with the database
          const isAdmin = await checkIsAdmin(session.user.email || '');
          console.log('ProtectedRoute: Admin check result:', isAdmin);

          if (!isAdmin) {
            console.log('ProtectedRoute: User is not admin, redirecting to dashboard');
            toast.error("Accesso negato", {
              description: "Non hai i permessi necessari per accedere a questa pagina"
            });
            navigate('/dashboard');
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
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('ProtectedRoute: User signed out');
        setIsAuthenticated(false);
        navigate('/login');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('ProtectedRoute: User signed in');
        setIsAuthenticated(true);
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
