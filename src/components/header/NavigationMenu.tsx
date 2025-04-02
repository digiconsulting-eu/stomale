
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ensureSessionHealthBeforeNavigation } from "@/utils/auth/sessionUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NavigationMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export const NavigationMenu = ({ isMobile = false, onItemClick }: NavigationMenuProps) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const menuItems = [
    { to: "/recensioni", label: "Ultime Recensioni" },
    { to: "/nuova-recensione", label: "Racconta la tua esperienza" },
    { to: "/cerca-patologia", label: "Cerca Patologia" },
    { to: "/inserisci-patologia", label: "Inserisci Patologia" },
    { to: "/cerca-sintomi", label: "Cerca Sintomi" },
  ];

  const baseClasses = "text-gray-600 hover:text-primary transition-colors";
  const mobileClasses = "block py-2";

  const handleNavigation = async (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
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
      
      if (!isLoggedIn) {
        // Not logged in, just navigate
        console.log('Not logged in, navigating to', path);
        navigate(path);
        return;
      }
      
      // Get current session - using a timeout to prevent long operations
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{data: {session: null}}>((resolve) => {
        setTimeout(() => resolve({ data: { session: null } }), 2000);
      });
      
      const { data } = await Promise.race([sessionPromise, timeoutPromise]);
      
      // If no session but localStorage says logged in, we have an inconsistency
      if (!data.session && isLoggedIn) {
        console.log('Session inconsistency detected: localStorage says logged in but no session found');
        
        if (path === '/nuova-recensione') {
          // For reviews, we need authentication
          toast.error("Sessione scaduta, effettua nuovamente l'accesso");
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          navigate('/login');
          return;
        } else {
          // For other pages, we can navigate but will clear the inconsistency
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          navigate(path);
          return;
        }
      }
      
      // We have a session, now check if it's healthy before proceeding
      console.log('Session exists, checking health before navigating to', path);
      const isSessionHealthy = await ensureSessionHealthBeforeNavigation();
      
      if (isSessionHealthy) {
        console.log('Session is healthy, navigating to', path);
        navigate(path);
      } else {
        console.log('Session not healthy, handling gracefully');
        
        // Special handling for different paths
        if (path === '/nuova-recensione') {
          // For sharing experiences, we need auth
          toast.error("Sessione scaduta, effettua nuovamente l'accesso");
          navigate('/login');
        } else {
          // For other paths, we can still try to navigate
          navigate(path);
          // But clear login state to be consistent
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
        }
      }
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
          onClick={(e) => handleNavigation(e, item.to)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
