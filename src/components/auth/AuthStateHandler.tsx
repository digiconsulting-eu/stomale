
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
      
      // Check if we're on the login page
      const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
      const isLoginUrl = location.pathname === '/login';
      
      // Double check to prevent redirects on login page
      if (isOnLoginPage || isLoginUrl) {
        console.log("On login page, preventing automatic redirects");
        return;
      }
      
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
            
            // Only redirect if we're not on the login page
            if (location.pathname !== '/dashboard' && !isOnLoginPage && !isLoginUrl) {
              console.log("Redirecting to dashboard after sign in");
              navigate('/dashboard', { replace: true });
            } else {
              console.log("Not redirecting: on login page or already at dashboard");
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
