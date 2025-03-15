
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const AuthStateHandler = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state from session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Session found on page load:", session);
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
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_IN') {
        if (session) {
          try {
            const { data: adminData } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            const isAdmin = Array.isArray(adminData) && adminData.length > 0;
            queryClient.setQueryData(['adminStatus'], isAdmin);
            
            // Redirect to dashboard on successful sign in
            // Only redirect if we're not already on the dashboard
            if (location.pathname !== '/dashboard') {
              console.log("Redirecting to dashboard after sign in");
              navigate('/dashboard', { replace: true });
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        queryClient.clear();
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, location.pathname]);

  return null;
};
