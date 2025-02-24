
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
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
  const { data: session, isLoading } = useAuthSession();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    const checkModalDisplay = () => {
      // Don't show modal if user is logged in or on excluded paths
      if (session || EXCLUDED_PATHS.includes(location.pathname)) {
        setIsOpen(false);
        return;
      }

      const lastInteraction = localStorage.getItem(LAST_MODAL_INTERACTION_KEY);
      const currentTime = Date.now();
      
      if (!lastInteraction || currentTime - parseInt(lastInteraction) > MODAL_TIMEOUT) {
        timer = setTimeout(() => {
          if (!session) {
            console.log("90 seconds elapsed, showing auth modal");
            setIsOpen(true);
          }
        }, MODAL_TIMEOUT);
      }
    };

    if (!isLoading) {
      checkModalDisplay();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [session, location.pathname, isLoading]);

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

  // Don't render anything if user is authenticated or loading
  if (session || isLoading) {
    return null;
  }

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
