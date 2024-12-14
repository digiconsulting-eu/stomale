import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  isMobile?: boolean;
}

export const AuthButtons = ({ isLoggedIn, isAdmin, onLogout, isMobile = false }: AuthButtonsProps) => {
  const buttonClass = isMobile ? "w-full justify-center" : "";

  if (isLoggedIn) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
        {isAdmin && (
          <Button asChild variant="ghost" className={buttonClass}>
            <Link to="/admin">Admin</Link>
          </Button>
        )}
        <Button asChild variant="ghost" className={buttonClass}>
          <Link to="/dashboard">Dashboard</Link>
        </Button>
        <Button 
          variant="outline" 
          onClick={onLogout}
          className={buttonClass}
        >
          Esci
        </Button>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'hidden md:flex items-center space-x-4'}`}>
      <Button asChild variant="ghost" className={buttonClass}>
        <Link to="/login">Accedi</Link>
      </Button>
      <Button asChild className={buttonClass}>
        <Link to="/registrati">Registrati</Link>
      </Button>
    </div>
  );
};