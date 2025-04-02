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
    const isOnLoginPage = sessionStorage.getItem('onLoginPage') === 'true' || 
                          location.pathname === '/login';
                          
    if (isOnLoginPage) {
      console.log("Header: On login page, skipping automatic auth checks");
      return;
    }
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuthenticated = !!session;
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated && session?.user?.email) {
        try {
          const { data: adminData } = await supabase
            .from('admin')
            .select('email')
            .eq('email', session.user.email);
          
          setIsAdmin(Array.isArray(adminData) && adminData.length > 0);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (sessionStorage.getItem('onLoginPage') === 'true' || location.pathname === '/login') {
        console.log("Header: On login page, ignoring auth state change");
        return;
      }
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in:", session?.user?.email);
        setIsLoggedIn(true);
        
        if (session?.user?.email) {
          try {
            const { data: adminData } = await supabase
              .from('admin')
              .select('email')
              .eq('email', session.user.email);
            
            setIsAdmin(Array.isArray(adminData) && adminData.length > 0);
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsMenuOpen(false);
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
      localStorage.setItem('wasLoggedIn', 'true');
      
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
