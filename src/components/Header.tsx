
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NavigationMenu } from "./header/NavigationMenu";
import { AuthButtons } from "./header/AuthButtons";
import { MobileMenu } from "./header/MobileMenu";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, isLoading: sessionLoading } = useAuthSession();
  const isLoggedIn = !!session;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Check admin status whenever session changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      if (session?.user?.email) {
        try {
          console.log("Checking admin status for:", session.user.email);
          const { data: adminData } = await supabase
            .from('admin')
            .select('email')
            .eq('email', session.user.email);
          
          const adminStatus = Array.isArray(adminData) && adminData.length > 0;
          console.log("Admin status:", adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [session]);

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      
      // First clear local state
      setIsAdmin(false);
      
      // Then attempt signOut
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during logout:', error);
        toast.error("Errore durante il logout");
        return;
      }
      
      // Clear any remaining local storage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdmin');
      
      // Force navigation
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error("Errore durante il logout");
      
      // Force navigation even on error
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
          <AuthButtons 
            isLoggedIn={isLoggedIn} 
            isAdmin={isAdmin} 
            onLogout={handleLogout}
            isLoading={isLoading || sessionLoading}
          />

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
        isLoading={isLoading || sessionLoading}
      />
    </header>
  );
};
