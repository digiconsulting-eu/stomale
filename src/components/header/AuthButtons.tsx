
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

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
  const isDashboard = location.pathname === '/dashboard';
  const isAdminPage = location.pathname.startsWith('/admin');
  const buttonClass = isMobile ? "w-full justify-center" : "";
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  if (isLoggedIn) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
        {isAdmin && !isAdminPage && (
          <Button asChild variant="ghost" className={buttonClass} onClick={handleClick}>
            <Link to="/admin">Admin</Link>
          </Button>
        )}
        {(!isDashboard || isAdminPage) && (
          <Button 
            asChild 
            variant="default"
            className={`${buttonClass} bg-[#0EA5E9] hover:bg-[#0284C7] text-white`} 
            onClick={handleClick}
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
      <Button asChild variant="ghost" className={buttonClass} onClick={handleClick}>
        <Link to="/login">Accedi</Link>
      </Button>
      <Button asChild className={`${buttonClass} text-white`} onClick={handleClick}>
        <Link to="/registrati">Registrati</Link>
      </Button>
    </div>
  );
};
