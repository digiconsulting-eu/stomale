
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { refreshSession } from "@/utils/auth";
import { toast } from "sonner";

export const AuthStateHandler = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state from session
    const initializeAuth = async () => {
      try {
        // First check if we need to refresh the session
        await refreshSession();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          return;
        }
        
        if (session) {
          console.log("Session found on page load:", session.user.email);
          // Pre-fetch admin status if user is logged in
          try {
            const { data: adminData, error: adminError } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            if (adminError) {
              console.error("Error checking admin status:", adminError);
              return;
            }
            
            const isAdmin = Array.isArray(adminData) && adminData.length > 0;
            console.log("User admin status:", isAdmin);
            
            // Cache the admin status
            queryClient.setQueryData(['adminStatus'], isAdmin);
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_IN') {
        if (session) {
          try {
            const { data: adminData, error } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            if (error) {
              console.error("Error checking admin status:", error);
              return;
            }
            
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
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Auth token refreshed successfully');
        // Invalidate queries to force refetch with new token
        queryClient.invalidateQueries();
      } else if (event === 'USER_UPDATED') {
        console.log('User profile updated');
        queryClient.invalidateQueries();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, location.pathname]);

  return null;
};
