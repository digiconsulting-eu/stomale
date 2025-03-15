
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ConditionActionsProps {
  condition: string;
  onNavigate: (sectionId: string) => void;
  onNewReview: () => void;
}

export const ConditionActions = ({ condition, onNavigate, onNewReview }: ConditionActionsProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        console.log("Checking auth in ConditionActions...");
        
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
      console.log("Auth state changed in ConditionActions:", event);
      setIsLoggedIn(event === 'SIGNED_IN');
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleNewReview = async () => {
    if (isCheckingAuth) {
      // Prevent action while still checking auth
      return;
    }
    
    // Double-check current authentication state
    const { data: { session } } = await supabase.auth.getSession();
    const currentlyLoggedIn = !!session;
    
    if (!currentlyLoggedIn) {
      toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
        description: "Registrati o accedi per condividere la tua esperienza"
      });
      navigate("/registrati", { state: { returnTo: `/patologia/${condition.toLowerCase()}` } });
      return;
    }
    
    onNewReview();
  };
  
  return (
    <div className="grid gap-4">
      <Button 
        className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        onClick={() => onNavigate('overview')}
      >
        Panoramica
      </Button>
      
      <Button 
        className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        onClick={() => onNavigate('experiences')}
      >
        Leggi Esperienze
      </Button>
      
      <Button 
        className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        onClick={handleNewReview}
        disabled={isCheckingAuth}
      >
        {isCheckingAuth ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Verifica accesso...
          </>
        ) : "Racconta la tua Esperienza"}
      </Button>
    </div>
  );
};
