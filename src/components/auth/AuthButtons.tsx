
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ensureSessionHealthBeforeNavigation } from "@/utils/auth/sessionUtils";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export const AuthButtons = ({ 
  isLoggedIn, 
  isAdmin, 
  onLogout, 
  isMobile = false,
  onNavigate
}: AuthButtonsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const isDashboard = location.pathname === '/dashboard';
  const isAdminPage = location.pathname.startsWith('/admin');
  const buttonClass = isMobile ? "w-full justify-center" : "";
  
  const handleClick = async (e: React.MouseEvent, path: string) => {
    // Don't perform action if already navigating
    if (isNavigating) {
      e.preventDefault();
      return;
    }
    
    // Check if we're already on this path
    if (location.pathname === path) {
      console.log(`Already on ${path}, skipping navigation`);
      if (onNavigate) onNavigate();
      return;
    }
    
    // For non-admin paths or non-admin users, let the Link component handle it
    if (!isAdmin || !path.startsWith('/admin')) {
      if (onNavigate) onNavigate();
      return;
    }
    
    // For admin paths and admin users, we need to validate the session first
    e.preventDefault();
    setIsNavigating(true);
    
    try {
      console.log('AuthButtons: Navigating to admin page:', path);
      
      // Ensure session is healthy before navigating to admin page
      const isSessionHealthy = await ensureSessionHealthBeforeNavigation();
      
      // Call onNavigate callback if provided (used for mobile menu close)
      if (onNavigate) onNavigate();
      
      if (isSessionHealthy) {
        // Force localStorage update before navigation
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', 'true');
        
        console.log('Session is healthy, navigating to admin page');
        navigate(path);
      } else {
        console.log('Session is not healthy, redirecting to login');
        localStorage.setItem('wasLoggedIn', 'true');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during admin navigation:', error);
      // Fall back to standard navigation
      navigate(path);
    } finally {
      setIsNavigating(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
        {isAdmin && !isAdminPage && (
          <Button 
            asChild 
            variant="ghost" 
            className={buttonClass}
          >
            <Link to="/admin" onClick={(e) => handleClick(e, '/admin')}>Admin</Link>
          </Button>
        )}
        {isAdmin && isAdminPage && location.pathname !== '/admin/users' && (
          <Button 
            asChild 
            variant="ghost" 
            className={buttonClass}
          >
            <Link to="/admin/users" onClick={(e) => handleClick(e, '/admin/users')}>Gestione Utenti</Link>
          </Button>
        )}
        {(!isDashboard || isAdminPage) && (
          <Button 
            asChild 
            variant="default"
            className={`${buttonClass} bg-[#0EA5E9] hover:bg-[#0284C7] text-white`}
          >
            <Link to="/dashboard" onClick={(e) => handleClick(e, '/dashboard')}>Dashboard</Link>
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={() => {
            onLogout();
            if (onNavigate) onNavigate();
          }}
          className={buttonClass}
          disabled={isNavigating}
        >
          Esci
        </Button>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
      <Button asChild variant="ghost" className={buttonClass} onClick={() => onNavigate && onNavigate()}>
        <Link to="/login">Accedi</Link>
      </Button>
      <Button asChild className={`${buttonClass} text-white`} onClick={() => onNavigate && onNavigate()}>
        <Link to="/registrati">Registrati</Link>
      </Button>
    </div>
  );
};
