import { Button } from "@/components/ui/button";
import { Menu, X, User, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "../assets/logo.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuthenticated = !!session;
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated) {
        try {
          const { data: adminData } = await supabase
            .from('admin')
            .select('email')
            .eq('email', session.user.email);
          
          const isUserAdmin = Array.isArray(adminData) && adminData.length > 0;
          setIsAdmin(isUserAdmin);
          console.log("Admin check in header:", { isUserAdmin, email: session.user.email });
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
      console.log("Auth state changed in header:", event);
      const isAuthenticated = !!session;
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated && session) {
        try {
          const { data: adminData } = await supabase
            .from('admin')
            .select('email')
            .eq('email', session.user.email);
          
          const isUserAdmin = Array.isArray(adminData) && adminData.length > 0;
          setIsAdmin(isUserAdmin);
          console.log("Admin status updated:", { isUserAdmin, email: session.user.email });
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setIsAdmin(false);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { to: "/recensioni", label: "Recensioni" },
    { to: "/nuova-recensione", label: "Racconta la tua esperienza" },
    { to: "/cerca-patologia", label: "Cerca Patologia" },
    { to: "/inserisci-patologia", label: "Inserisci Patologia" },
    { to: "/cerca-sintomi", label: "Cerca Sintomi" },
    { to: "/blog", label: "Blog" },
  ];

  const renderAuthButtons = () => {
    if (isLoggedIn) {
      return (
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden md:flex items-center gap-2">
              <Link to="/admin">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="hidden md:flex items-center gap-2">
            <Link to="/dashboard">
              <User className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Esci
          </Button>
        </div>
      );
    }
    return (
      <div className="hidden md:flex items-center space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/login">Accedi</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/registrati">Registrati</Link>
        </Button>
      </div>
    );
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logo}
              alt="StoMale.info Logo" 
              className="h-12 w-auto"
              style={{ objectFit: 'contain' }}
            />
          </Link>

          <nav className="hidden md:flex space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {renderAuthButtons()}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={toggleMenu}
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-gray-600 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-primary transition-colors"
                  >
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accedi
                  </Link>
                  <Link
                    to="/registrati"
                    className="text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrati
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};