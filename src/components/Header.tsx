
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NavigationMenu } from "./header/NavigationMenu";
import { AuthButtons } from "./header/AuthButtons";
import { MobileMenu } from "./header/MobileMenu";
import { toast } from "sonner";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Check for login page or redirect prevention flags - improved logging
    const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
    const preventRedirects = localStorage.getItem('preventRedirects') === 'true';
    const isOnLoginRoute = location.pathname === '/login';
                          
    if (isOnLoginPage || preventRedirects || isOnLoginRoute) {
      console.log("Header: On login page, skipping automatic auth checks", {
        isOnLoginPage,
        preventRedirects,
        isOnLoginRoute,
        path: location.pathname
      });
      
      // Even on login page, check local storage for UI state
      const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
      
      if (storedLoggedIn !== isLoggedIn) {
        setIsLoggedIn(storedLoggedIn);
      }
      
      if (storedIsAdmin !== isAdmin) {
        setIsAdmin(storedIsAdmin);
      }
      
      return;
    }
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isAuthenticated = !!session;
        
        console.log("Header: Checking auth status. User authenticated:", isAuthenticated);
        
        setIsLoggedIn(isAuthenticated);
        
        // Store in local storage for other components to use
        if (isAuthenticated) {
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          localStorage.removeItem('isLoggedIn');
        }
        
        if (isAuthenticated && session?.user?.email) {
          try {
            const { data: adminData } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            const userIsAdmin = Array.isArray(adminData) && adminData.length > 0;
            setIsAdmin(userIsAdmin);
            localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');
            localStorage.setItem('userEmail', session.user.email);
            console.log("Header: User is admin:", userIsAdmin);
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
            localStorage.removeItem('isAdmin');
          }
        } else {
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('userEmail');
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in Header:", event);
      
      // Re-check login page flags as they can change during auth events
      const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true';
      const preventRedirects = localStorage.getItem('preventRedirects') === 'true';
      const isOnLoginRoute = location.pathname === '/login';
      
      if (isOnLoginPage || preventRedirects || isOnLoginRoute) {
        console.log("Header: On login page, listening for login events only", {
          isOnLoginPage,
          preventRedirects,
          isOnLoginRoute
        });
        
        // Even on login page, we should update the UI if user logs in
        if (event === 'SIGNED_IN' && session) {
          console.log("Header: Login detected on login page, updating UI state");
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
          
          if (session.user?.email) {
            try {
              const { data: adminData } = await supabase
                .from('admin')
                .select('email')
                .eq('email', session.user.email);
              
              const userIsAdmin = Array.isArray(adminData) && adminData.length > 0;
              setIsAdmin(userIsAdmin);
              localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');
              localStorage.setItem('userEmail', session.user.email);
            } catch (error) {
              console.error("Error checking admin status:", error);
              setIsAdmin(false);
            }
          }
        }
        
        return;
      }
      
      if (event === 'SIGNED_IN') {
        console.log("Header detected sign in:", session?.user?.email);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        
        if (session?.user?.email) {
          try {
            const { data: adminData } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            const userIsAdmin = Array.isArray(adminData) && adminData.length > 0;
            setIsAdmin(userIsAdmin);
            localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');
            localStorage.setItem('userEmail', session.user.email);
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("Header detected sign out");
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsMenuOpen(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userEmail');
        
        if (localStorage.getItem('wasLoggedIn') === 'true') {
          toast.success("Logout effettuato con successo");
          localStorage.removeItem('wasLoggedIn');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      // Ensure we don't show logout message again on initial load
      if (isLoggedIn) {
        localStorage.setItem('wasLoggedIn', 'true');
      }
      
      // Immediately update UI state - don't wait for the auth event
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsMenuOpen(false);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during logout:', error);
        toast.error("Errore durante il logout");
        return;
      }
      
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userEmail');
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error("Errore durante il logout");
      
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <img 
              src="/lovable-uploads/92055c77-766b-4e12-8cf9-d2959e377076.png"
              alt="StoMale.info Logo" 
              className="h-16 w-auto"
              style={{ objectFit: 'contain' }}
            />
          </Link>

          <NavigationMenu />
          <AuthButtons isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <MobileMenu 
        isOpen={isMenuOpen}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  );
};
