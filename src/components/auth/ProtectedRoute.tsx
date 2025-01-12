import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Accesso negato", {
            description: "Devi effettuare l'accesso per visualizzare questa pagina"
          });
          navigate('/login');
          return;
        }

        if (adminOnly) {
          const { data: isAdmin } = await supabase.rpc('is_admin', {
            user_id: session.user.id
          });

          if (!isAdmin) {
            toast.error("Accesso negato", {
              description: "Non hai i permessi necessari per accedere a questa pagina"
            });
            navigate('/');
            return;
          }
        }

        setIsAuthenticated(true);
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
        setIsAuthenticated(false);
        navigate('/login');
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, adminOnly]);

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};