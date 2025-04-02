
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavigationMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export const NavigationMenu = ({ isMobile = false, onItemClick }: NavigationMenuProps) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const menuItems = [
    { to: "/recensioni", label: "Ultime Recensioni", requiresAuth: false },
    { to: "/nuova-recensione", label: "Racconta la tua esperienza", requiresAuth: true },
    { to: "/cerca-patologia", label: "Cerca Patologia", requiresAuth: false },
    { to: "/inserisci-patologia", label: "Inserisci Patologia", requiresAuth: true },
    { to: "/cerca-sintomi", label: "Cerca Sintomi", requiresAuth: false },
  ];

  const baseClasses = "text-gray-600 hover:text-primary transition-colors";
  const mobileClasses = "block py-2";

  const handleNavigation = async (e: React.MouseEvent<HTMLAnchorElement>, path: string, requiresAuth: boolean) => {
    e.preventDefault();
    
    // Prevent multiple clicks
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    try {
      console.log(`NavigationMenu: Attempting navigation to ${path}`);
      
      // First check if we're already on this page
      if (window.location.pathname === path) {
        console.log('Already on this page, no navigation needed');
        if (onItemClick) onItemClick();
        setIsNavigating(false);
        return;
      }
      
      // First call the onItemClick callback (for mobile menu)
      if (onItemClick) onItemClick();
      
      // Check if user is logged in according to local storage
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      // If this page requires auth and the user is not logged in, redirect to login
      if (requiresAuth && !isLoggedIn) {
        console.log(`Page ${path} requires authentication, redirecting to login`);
        toast.error("Devi effettuare l'accesso per accedere a questa funzionalità");
        navigate('/login');
        setIsNavigating(false);
        return;
      }
      
      // For pages that don't require auth or if user is already logged in, just navigate
      if (!requiresAuth || !isLoggedIn) {
        navigate(path);
        setIsNavigating(false);
        return;
      }
      
      // If page requires auth and user is logged in, verify session before proceeding
      const { data } = await supabase.auth.getSession();
      
      // If no session but localStorage says logged in, we have an inconsistency
      if (!data.session && isLoggedIn) {
        console.log('Session inconsistency detected: localStorage says logged in but no session found');
        
        if (path === '/nuova-recensione' || path === '/inserisci-patologia') {
          // For pages requiring authentication
          toast.error("Sessione scaduta, effettua nuovamente l'accesso");
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          navigate('/login');
          setIsNavigating(false);
          return;
        } else {
          // For other pages, we can navigate but will clear the inconsistency
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          navigate(path);
          setIsNavigating(false);
          return;
        }
      }
      
      // Session exists, navigate to the requested page
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fall back to standard navigation
      navigate(path);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <nav className={`${isMobile ? 'flex flex-col space-y-2' : 'hidden md:flex space-x-6'}`}>
      {menuItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`${baseClasses} ${isMobile ? mobileClasses : ''}`}
          onClick={(e) => handleNavigation(e, item.to, item.requiresAuth)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
