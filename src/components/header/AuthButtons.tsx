import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, ShieldCheck } from "lucide-react";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  isMobile?: boolean;
}

export const AuthButtons = ({ isLoggedIn, isAdmin, onLogout, isMobile = false }: AuthButtonsProps) => {
  if (isLoggedIn) {
    return (
      <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex items-center space-x-2'}`}>
        {isAdmin && (
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className={`${isMobile ? 'flex' : 'hidden md:flex'} items-center gap-2`}
          >
            <Link to="/admin">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        )}
        <Button 
          asChild 
          variant="outline" 
          size="sm" 
          className={`${isMobile ? 'flex' : 'hidden md:flex'} items-center gap-2`}
        >
          <Link to="/dashboard">
            <User className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onLogout}>
          Esci
        </Button>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'flex flex-col space-y-4' : 'hidden md:flex items-center space-x-2'}`}>
      <Button asChild variant="outline" size="sm">
        <Link to="/login">Accedi</Link>
      </Button>
      <Button asChild size="sm">
        <Link to="/registrati">Registrati</Link>
      </Button>
    </div>
  );
};