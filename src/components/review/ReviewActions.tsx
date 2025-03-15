
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewActionsProps {
  condition: string;
}

export const ReviewActions = ({ condition }: ReviewActionsProps) => {
  const conditionName = capitalizeFirstLetter(condition);
  const formattedCondition = condition.toLowerCase(); // Mantenendo gli spazi originali
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        console.log("Checking auth in ReviewActions...");
        
        // Force refresh the session to ensure we have the latest state
        await supabase.auth.refreshSession();
        const { data: { session } } = await supabase.auth.getSession();
        
        const loggedIn = !!session;
        console.log("User logged in status:", loggedIn);
        setIsLoggedIn(loggedIn);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in ReviewActions:", event);
      setIsLoggedIn(event === 'SIGNED_IN');
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleNewReview = async (e: React.MouseEvent) => {
    if (isCheckingAuth) {
      // Prevent default action while checking auth
      e.preventDefault();
      return;
    }
    
    // Double-check current authentication state
    const { data: { session } } = await supabase.auth.getSession();
    const currentlyLoggedIn = !!session;
    
    if (!currentlyLoggedIn) {
      e.preventDefault();
      toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
        description: "Registrati o accedi per condividere la tua esperienza"
      });
      navigate("/registrati", { state: { returnTo: `/nuova-recensione?patologia=${formattedCondition}` } });
      return false;
    }
    
    // Allow the link to work normally if logged in
    return true;
  };
  
  return (
    <div className="mb-8">
      {/* Mobile: solo testo */}
      <div className="block md:hidden">
        {isCheckingAuth ? (
          <div className="flex justify-center items-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
            <span className="text-primary">Verifica accesso...</span>
          </div>
        ) : (
          <Link 
            to={`/nuova-recensione?patologia=${formattedCondition}`}
            className="block text-xl font-semibold text-primary hover:text-primary-hover text-center"
            onClick={handleNewReview}
          >
            Racconta la tua Esperienza con {conditionName}
          </Link>
        )}
      </div>

      {/* Desktop: pulsante */}
      <div className="hidden md:block">
        {isCheckingAuth ? (
          <Button 
            className="w-full py-8 text-xl font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg rounded-lg transition-all duration-200 border border-primary-hover"
            disabled
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Verifica accesso...
          </Button>
        ) : (
          <Link 
            to={`/nuova-recensione?patologia=${formattedCondition}`}
            onClick={handleNewReview}
          >
            <Button 
              className="w-full py-8 text-xl font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg rounded-lg transition-all duration-200 border border-primary-hover"
            >
              Racconta la tua Esperienza con {conditionName}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
