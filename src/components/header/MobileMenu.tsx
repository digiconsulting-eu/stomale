
import { AuthButtons } from "./AuthButtons";
import { NavigationMenu } from "./NavigationMenu";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col md:hidden animate-slide-in overflow-y-auto">
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <NavigationMenu isMobile onItemClick={onClose} />
        <div className="mt-8">
          <AuthButtons 
            isLoggedIn={isLoggedIn} 
            isAdmin={isAdmin} 
            onLogout={onLogout} 
            isMobile 
            onNavigate={onClose}
          />
        </div>
      </div>
    </div>
  );
};
