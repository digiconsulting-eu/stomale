
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const isDashboard = location.pathname === '/dashboard';
  const isAdminPage = location.pathname.startsWith('/admin');
  const buttonClass = isMobile ? "w-full justify-center" : "";
  
  const handleClick = (e: React.MouseEvent, path: string) => {
    // Call onNavigate callback if provided (used for mobile menu close)
    if (onNavigate) {
      onNavigate();
    }
    
    // Only handle admin navigation specially - remove the general interception of clicks
    if (isAdmin && path.startsWith('/admin')) {
      e.preventDefault();
      console.log('AdminButtons: Navigating to admin page:', path);
      
      // Force localStorage update before navigation
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', 'true');
      
      navigate(path);
    }
    // For all other navigation, let the Link component handle it naturally
  };

  if (isLoggedIn) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
        {isAdmin && !isAdminPage && (
          <Button 
            asChild 
            variant="ghost" 
            className={buttonClass}
            onClick={(e) => handleClick(e, '/admin')}
          >
            <Link to="/admin">Admin</Link>
          </Button>
        )}
        {isAdmin && isAdminPage && location.pathname !== '/admin/users' && (
          <Button 
            asChild 
            variant="ghost" 
            className={buttonClass}
            onClick={(e) => handleClick(e, '/admin/users')}
          >
            <Link to="/admin/users">Gestione Utenti</Link>
          </Button>
        )}
        {(!isDashboard || isAdminPage) && (
          <Button 
            asChild 
            variant="default"
            className={`${buttonClass} bg-[#0EA5E9] hover:bg-[#0284C7] text-white`}
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={() => {
            onLogout();
            if (onNavigate) onNavigate();
          }}
          className={buttonClass}
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
