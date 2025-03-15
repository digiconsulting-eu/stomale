
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const AuthStateHandler = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state from session
    const initializeAuth = async () => {
      console.log("Initializing auth state...");
      try {
        // Force refresh the session to ensure we have the latest state
        await supabase.auth.refreshSession();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found on page load:", session.user.email);
          
          // Pre-fetch admin status if user is logged in
          try {
            const { data: adminData } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            const isAdmin = Array.isArray(adminData) && adminData.length > 0;
            console.log("User admin status:", isAdmin);
            
            // Cache the admin status
            queryClient.setQueryData(['adminStatus'], isAdmin);
            
            // Invalidate queries to refresh data based on the authenticated user
            queryClient.invalidateQueries();
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        } else {
          console.log("No session found on page load");
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_IN') {
        if (session) {
          console.log("User signed in:", session.user.email);
          
          // Update query cache with session
          queryClient.setQueryData(['auth-session'], session);
          
          try {
            const { data: adminData } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            const isAdmin = Array.isArray(adminData) && adminData.length > 0;
            queryClient.setQueryData(['adminStatus'], isAdmin);
            
            // Invalidate all queries to refresh data
            setTimeout(() => {
              queryClient.invalidateQueries();
              
              // Only redirect if we're not already on the dashboard
              if (location.pathname === '/login' || location.pathname === '/registrati') {
                console.log("Redirecting to dashboard after sign in");
                navigate('/dashboard', { replace: true });
                toast.success("Accesso effettuato con successo");
              }
            }, 100);
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        queryClient.setQueryData(['auth-session'], null);
        queryClient.setQueryData(['adminStatus'], false);
        queryClient.clear();
        
        // A small delay before redirecting to avoid race conditions
        setTimeout(() => {
          if (location.pathname.includes('dashboard') || location.pathname.includes('admin')) {
            navigate('/', { replace: true });
            toast.success("Logout effettuato con successo");
          }
        }, 100);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed for user:", session?.user?.email);
        if (session) {
          queryClient.setQueryData(['auth-session'], session);
          setTimeout(() => {
            queryClient.invalidateQueries();
          }, 100);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, location.pathname]);

  return null;
};
