import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async (email: string) => {
      try {
        const { data: adminData, error } = await supabase
          .from('admin')
          .select('email')
          .eq('email', email);
        
        if (error) throw error;
        
        const isAdmin = Array.isArray(adminData) && adminData.length > 0;
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        return isAdmin;
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    };

    const handleAuthChange = async (event: string, session: any) => {
      try {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          localStorage.setItem('isLoggedIn', 'true');
          const isAdmin = await checkAdminStatus(session.user.email);
          
          // Only redirect if we're on the login page
          if (location.pathname === '/login') {
            navigate(isAdmin ? '/admin' : '/dashboard');
            toast.success('Accesso effettuato con successo');
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          
          const protectedRoutes = ['/dashboard', '/admin'];
          if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
            navigate('/');
            toast.success('Logout effettuato con successo');
          }
        }
      } catch (error) {
        console.error('Error in auth change handler:', error);
        toast.error('Errore durante la gestione dell\'autenticazione');
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check initial auth state
    const checkInitialAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user?.email) {
          localStorage.setItem('isLoggedIn', 'true');
          await checkAdminStatus(session.user.email);
        } else {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
        }
      } catch (error) {
        console.error('Error checking initial auth:', error);
      }
    };

    checkInitialAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  return null;
};