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

const MODAL_TIMEOUT = 90000; // 90 seconds in milliseconds
const LAST_MODAL_INTERACTION_KEY = 'lastAuthModalInteraction';

// Pages where the modal should not appear
const EXCLUDED_PATHS = [
  '/login',
  '/registrati',
  '/cookie-policy',
  '/privacy-policy',
  '/terms',
  '/aggiorna-password',
  '/recupera-password'
];

export const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Don't show modal if user is logged in or on excluded paths
      if (session || EXCLUDED_PATHS.includes(location.pathname)) {
        setIsOpen(false);
        return;
      }

      console.log("User not logged in, checking last modal interaction...");
      const lastInteraction = localStorage.getItem(LAST_MODAL_INTERACTION_KEY);
      const currentTime = Date.now();
      
      if (!lastInteraction || currentTime - parseInt(lastInteraction) > MODAL_TIMEOUT) {
        const timer = setTimeout(() => {
          console.log("90 seconds elapsed, showing auth modal");
          setIsOpen(true);
        }, MODAL_TIMEOUT);
        
        return () => {
          console.log("Clearing auth modal timer");
          clearTimeout(timer);
        };
      } else {
        console.log("Modal interaction too recent, waiting...");
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

  const handleModalInteraction = () => {
    localStorage.setItem(LAST_MODAL_INTERACTION_KEY, Date.now().toString());
    setIsOpen(false);
  };

  const handleLogin = () => {
    handleModalInteraction();
    navigate('/login');
  };

  const handleRegister = () => {
    handleModalInteraction();
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