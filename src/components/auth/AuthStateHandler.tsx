
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { refreshSession } from "@/utils/auth/sessionUtils";

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
        
        // CRITICAL FIX: Immediately check localStorage first for faster decisions
        const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
        
        // Only certain paths require authentication
        const requiresAuth = [
          '/nuova-recensione',
          '/inserisci-patologia',
          '/dashboard',
          '/admin'
        ];
        
        const currentPathRequiresAuth = requiresAuth.some(path => 
          location.pathname === path || 
          (path === '/admin' && location.pathname.startsWith('/admin/'))
        );
        
        // Only redirect to login if on a protected path and not logged in
        if (currentPathRequiresAuth && !storedLoggedIn) {
          console.log(`Path ${location.pathname} requires authentication and user is not logged in, redirecting to login`);
          navigate('/login', { replace: true });
          setInitialized(true);
          return;
        }
        
        // If logged in as admin, redirect to admin unless already there
        if (storedLoggedIn && storedIsAdmin) {
          if (location.pathname === '/dashboard') {
            console.log('Admin user on dashboard, redirecting to admin page');
            navigate('/admin', { replace: true });
          }
        }
        
        // If not logged in but localStorage says we are, check session
        if (storedLoggedIn) {
          console.log('Stored login state found, checking session validity');
          
          const { data } = await supabase.auth.getSession();
          
          // If no valid session but localStorage says logged in, clear local state
          if (!data.session) {
            console.log('Session mismatch: localStorage says logged in but no session found');
            
            // Only force redirect if on a protected path
            if (currentPathRequiresAuth) {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('isAdmin');
              navigate('/login', { replace: true });
              setInitialized(true);
              return;
            } else {
              // Just clear localStorage but allow navigation
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('isAdmin');
            }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('isLoggedIn', 'true');
        
        // Check if this is an admin user
        setTimeout(async () => {
          try {
            const { data } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            const isAdmin = Array.isArray(data) && data.length > 0;
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            
            if (isAdmin && location.pathname === '/dashboard') {
              navigate('/admin', { replace: true });
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        
        // Only redirect to login if on a protected path
        const currentPath = location.pathname;
        const requiresAuth = [
          '/nuova-recensione',
          '/inserisci-patologia',
          '/dashboard',
          '/admin'
        ];
        
        if (requiresAuth.some(path => 
            currentPath === path || 
            (path === '/admin' && currentPath.startsWith('/admin/'))
          )) {
          console.log("User signed out from protected path, redirecting to login");
          navigate('/login', { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, location.pathname]);

  return null;
};
