
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
        // Check for redirect prevention flags
        const isLoginPage = location.pathname === '/login';
        const hasPreventRedirects = localStorage.getItem('preventRedirects') === 'true';
        const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
        
        // Skip auth handling if on login page or redirect prevention is active
        if (isLoginPage || hasPreventRedirects || isOnLoginPage) {
          console.log("AuthStateHandler: Skipping auth initialization due to login page or prevention flags");
          return;
        }
        
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

    // Only run if we're NOT on the login page or if redirect prevention flags are not set
    const isLoginPage = location.pathname === '/login';
    const hasPreventRedirects = localStorage.getItem('preventRedirects') === 'true';
    const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
    
    if (!isLoginPage && !hasPreventRedirects && !isOnLoginPage) {
      initializeAuth();
    } else {
      console.log("Skipping auth initialization due to login page or prevention flags");
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      // Double check for redirect prevention flags - CRITICAL CHECK
      const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
      const hasPreventRedirects = localStorage.getItem('preventRedirects') === 'true';
      const isLoginPage = location.pathname === '/login';
      
      if (isLoginPage || isOnLoginPage || hasPreventRedirects) {
        console.log("On login page or redirect prevention active, preventing automatic redirects");
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
            
            // Only redirect if we're not already on the dashboard
            if (location.pathname !== '/dashboard') {
              console.log("Redirecting to dashboard after sign in");
              navigate('/dashboard', { replace: true });
            } else {
              console.log("Already at dashboard, no redirect needed");
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        queryClient.clear();
        
        // Only redirect if we're not on the login page
        if (location.pathname !== '/login') {
          console.log("User signed out, redirecting to home");
          navigate('/');
        }
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
