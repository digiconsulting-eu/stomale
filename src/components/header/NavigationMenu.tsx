
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
    
    // First check if we're already on this page
    if (window.location.pathname === path) {
      console.log('Already on this page, no navigation needed');
      if (onItemClick) onItemClick();
      setIsNavigating(false);
      return;
    }
    
    // First call the onItemClick callback (for mobile menu)
    if (onItemClick) onItemClick();
    
    try {
      // Check if user is logged in according to local storage
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn) {
        // Not logged in, just navigate
        console.log('Not logged in, navigating to', path);
        navigate(path);
        return;
      }
      
      console.log('Checking session health before navigating to', path);
      
      // Ensure session is healthy before navigation
      const isSessionHealthy = await ensureSessionHealthBeforeNavigation();
      
      if (!isSessionHealthy) {
        console.log('Session not healthy, redirecting to login');
        
        // Check if session exists despite our health check failing
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          // No session, clear login state
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          
          // Show toast and redirect to login
          toast.error("Sessione scaduta, effettua nuovamente l'accesso");
          navigate('/login');
        } else {
          // We have a session but health check failed - try to continue
          console.log('Session exists but health check failed, attempting navigation anyway');
          navigate(path);
        }
      } else {
        // Session is healthy, proceed with navigation
        console.log('Session is healthy, navigating to', path);
        navigate(path);
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
