
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
  isLoading?: boolean;
}

export const AuthButtons = ({ 
  isLoggedIn, 
  isAdmin, 
  onLogout, 
  isMobile = false,
  onNavigate,
  isLoading = false
}: AuthButtonsProps) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const buttonClass = isMobile ? "w-full justify-center" : "";
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  if (isLoading) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
        <Button variant="ghost" disabled className={buttonClass}>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Caricamento...
        </Button>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
        {isAdmin && (
          <Button asChild variant="ghost" className={buttonClass} onClick={handleClick}>
            <Link to="/admin">Admin</Link>
          </Button>
        )}
        <Button 
          asChild 
          variant="default"
          className={`${buttonClass} bg-[#0EA5E9] hover:bg-[#0284C7] text-white`} 
          onClick={handleClick}
        >
          <Link to="/dashboard">Dashboard</Link>
        </Button>
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
