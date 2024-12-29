import { AuthButtons } from "./AuthButtons";
import { NavigationMenu } from "./NavigationMenu";

interface MobileMenuProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  onClose: () => void;
}

export const MobileMenu = ({ 
  isOpen, 
  isLoggedIn, 
  isAdmin, 
  onLogout, 
  onClose 
}: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <NavigationMenu isMobile onItemClick={onClose} />
        <AuthButtons 
          isLoggedIn={isLoggedIn} 
          isAdmin={isAdmin} 
          onLogout={onLogout} 
          isMobile 
          onNavigate={onClose}
        />
      </div>
    </div>
  );
};