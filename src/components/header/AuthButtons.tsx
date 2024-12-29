import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  const buttonClass = isMobile ? "w-full justify-center" : "";
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  if (isLoggedIn) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
        {isAdmin && (
          <Button asChild variant="ghost" className={buttonClass} onClick={handleClick}>
            <Link to="/admin">Admin</Link>
          </Button>
        )}
        <Button asChild variant="ghost" className={buttonClass} onClick={handleClick}>
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
      <Button asChild className={buttonClass} onClick={handleClick}>
        <Link to="/registrati">Registrati</Link>
      </Button>
    </div>
  );
};