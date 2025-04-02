
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { refreshSession } from "@/utils/auth/sessionUtils";
import { toast } from "sonner";

export const AuthStateHandler = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);
  const isProcessingAuthChange = useRef(false);

  useEffect(() => {
    // Initialize auth state from session
    const initializeAuth = async () => {
      try {
        // Check for redirect prevention flags with more detailed logging
        const isLoginPage = location.pathname === '/login';
        const hasPreventRedirects = localStorage.getItem('preventRedirects') === 'true';
        const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
        const loginPageActive = localStorage.getItem('loginPageActive');
        
        // More reliable prevention check with timestamp
        const isInLoginProcess = loginPageActive && 
          (Date.now() - parseInt(loginPageActive, 10)) < 60000; // within last minute
        
        // CRITICAL FIX: Detect sessions where prevention flags were left in a bad state
        // If we're not actually on the login page but flags say we are, clean them up
        if (!isLoginPage && (isOnLoginPage || hasPreventRedirects || isInLoginProcess)) {
          console.log("Not actually on login page but prevention flags found, cleaning up stale flags");
          if (location.pathname !== '/login') {
            sessionStorage.removeItem('onLoginPage');
            localStorage.removeItem('preventRedirects');
            localStorage.removeItem('loginPageActive');
          }
        }
        
        // Skip auth handling if on login page or redirect prevention is active
        if (isLoginPage || hasPreventRedirects || isOnLoginPage || isInLoginProcess) {
          console.log("AuthStateHandler: Skipping auth initialization due to prevention flags", {
            isLoginPage,
            hasPreventRedirects,
            isOnLoginPage,
            isInLoginProcess,
            path: location.pathname
          });
          setInitialized(true);
          return;
        }
        
        // First check if we need to refresh the session
        await refreshSession();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setInitialized(true);
          return;
        }
        
        if (session) {
          console.log("Session found on page load:", session.user.email);
          // Pre-fetch admin status if user is logged in
          try {
            // Use setTimeout to avoid potential deadlocks with Supabase client
            setTimeout(async () => {
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
                
                // Set local indicators of login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
                localStorage.setItem('userEmail', session.user.email);
                
                // CRITICAL FIX: Handle redirects for admins
                if (isAdmin && location.pathname !== '/admin' && 
                    !location.pathname.startsWith('/admin/')) {
                  console.log("Detected admin user, redirecting to admin dashboard");
                  navigate('/admin', { replace: true });
                }
              } catch (error) {
                console.error("Error checking admin status:", error);
              }
            }, 0);
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        } else {
          // If no session, ensure we clear any stale login state
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('userEmail');
          
          // CRITICAL FIX: Don't redirect to login if already on home page
          if (!isLoginPage && !location.pathname.startsWith('/login') && 
              !location.pathname.startsWith('/registrati') && 
              !location.pathname.startsWith('/recupera-password') &&
              location.pathname !== '/' && // Don't redirect from home page
              !hasPreventRedirects && !isOnLoginPage && !isInLoginProcess) {
            console.log("No session found, redirecting to login");
            navigate('/login', { replace: true });
            return;
          }
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      // CRITICAL FIX: Skip handling if we're on login page - let login component handle it
      if (location.pathname === '/login') {
        console.log("Auth state changed on login page, letting login page handle it");
        return;
      }
      
      // Avoid re-entrance issues with a processing flag
      if (isProcessingAuthChange.current) {
        console.log("Already processing an auth change, skipping");
        return;
      }
      
      isProcessingAuthChange.current = true;
      
      try {
        // Check for redirect prevention flags BEFORE handling any auth changes
        const preventRedirects = localStorage.getItem('preventRedirects') === 'true';
        const onLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
        const isLoginPage = location.pathname === '/login';
        const loginPageActive = localStorage.getItem('loginPageActive');
        const isInLoginProcess = loginPageActive && 
          (Date.now() - parseInt(loginPageActive, 10)) < 60000; // within last minute
          
        const isLogin = event === 'SIGNED_IN';
        
        // CRITICAL FIX: For admin users, redirect to admin instead of dashboard
        if (isLogin && session) {
          console.log("SIGNED_IN event detected with valid session");
          
          try {
            // Wait a moment to ensure admin status is saved in localStorage
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Check if admin status already determined in loginUtils
            let isAdmin = localStorage.getItem('isAdmin') === 'true';
            
            // If admin status not yet determined, check it
            if (isAdmin !== true) {
              const { data: adminData, error } = await supabase
                .from('admin')
                .select('email')
                .eq('email', session.user.email);
              
              if (error) {
                console.error("Error checking admin status:", error);
                isProcessingAuthChange.current = false;
                return;
              }
              
              isAdmin = Array.isArray(adminData) && adminData.length > 0;
              queryClient.setQueryData(['adminStatus'], isAdmin);
              
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
              localStorage.setItem('userEmail', session.user.email);
            }
            
            // CRITICAL FIX: Clear prevention flags BEFORE redirecting
            sessionStorage.removeItem('onLoginPage');
            localStorage.removeItem('preventRedirects');
            localStorage.removeItem('loginPageActive');
            
            // CRITICAL FIX: Admin users should go to admin page
            const redirectTarget = isAdmin ? '/admin' : '/dashboard';
            
            // Only redirect if we're not already there
            if (location.pathname !== redirectTarget && 
                !(isAdmin && location.pathname.startsWith('/admin/'))) {
              console.log(`Redirecting to ${redirectTarget} after sign in`);
              navigate(redirectTarget, { replace: true });
            } else {
              console.log(`Already at ${redirectTarget}, no redirect needed`);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
          } finally {
            isProcessingAuthChange.current = false;
          }
          return;
        }
        
        // Block auth events if prevention flags are set
        if (preventRedirects || onLoginPage || isInLoginProcess) {
          console.log("Auth event blocked due to prevention flags:", event, {
            preventRedirects,
            onLoginPage,
            isInLoginProcess,
            isLoginPage,
            path: location.pathname
          });
          isProcessingAuthChange.current = false;
          return;
        }
        
        if (event === 'SIGNED_IN') {
          // Handled above
          isProcessingAuthChange.current = false;
        } else if (event === 'SIGNED_OUT') {
          console.log("SIGNED_OUT event detected");
          queryClient.clear();
          
          // Make sure to clean up
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('userEmail');
          
          // CRITICAL CHANGE: Only redirect if we're not on the login page AND not in a login process
          if (location.pathname !== '/login' && !isInLoginProcess) {
            console.log("User signed out, redirecting to login");
            navigate('/login', { replace: true });
          } else {
            console.log("Already on login page or in login process, no redirect needed after sign out");
          }
          isProcessingAuthChange.current = false;
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed successfully');
          // Invalidate queries to force refetch with new token
          queryClient.invalidateQueries();
          isProcessingAuthChange.current = false;
        } else if (event === 'USER_UPDATED') {
          console.log('User profile updated');
          queryClient.invalidateQueries();
          isProcessingAuthChange.current = false;
        } else {
          isProcessingAuthChange.current = false;
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        isProcessingAuthChange.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, location.pathname]);

  return null;
};
