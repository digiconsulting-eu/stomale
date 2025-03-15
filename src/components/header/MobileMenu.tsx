
import { AuthButtons } from "./AuthButtons";
import { NavigationMenu } from "./NavigationMenu";

interface MobileMenuProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const MobileMenu = ({ 
  isOpen, 
  isLoggedIn, 
  isAdmin, 
  onLogout, 
  onClose,
  isLoading = false
}: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-gray-100 bg-white shadow-md animate-fade-in">
      <div className="container mx-auto px-4 py-4">
        <NavigationMenu isMobile onItemClick={onClose} />
        <div className="mt-4">
          <AuthButtons 
            isLoggedIn={isLoggedIn} 
            isAdmin={isAdmin} 
            onLogout={onLogout} 
            isMobile 
            onNavigate={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
