import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const timer = setTimeout(() => {
          // Don't show modal on login or register pages
          if (!['/login', '/registrati'].includes(location.pathname)) {
            setIsOpen(true);
          }
        }, 90000); // 90 seconds
        return () => clearTimeout(timer);
      } else {
        setIsOpen(false);
      }
    };

    checkAuthStatus();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in modal:", event);
      if (session) {
        setIsOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname]);

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const handleRegister = () => {
    setIsOpen(false);
    navigate('/registrati');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Accedi per continuare</DialogTitle>
          <DialogDescription className="text-center pt-4">
            Per continuare a navigare su StoMale.info è necessario effettuare l'accesso o registrarsi.
            La registrazione è gratuita e ti permette di accedere a tutte le funzionalità del sito.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button onClick={handleLogin} variant="outline" className="flex-1">
            Accedi
          </Button>
          <Button onClick={handleRegister} className="flex-1">
            Registrati
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};