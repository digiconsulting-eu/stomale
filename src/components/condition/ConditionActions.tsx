
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ConditionActionsProps {
  condition: string;
  onNavigate: (sectionId: string) => void;
  onNewReview: () => void;
}

export const ConditionActions = ({ condition, onNavigate, onNewReview }: ConditionActionsProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      setIsLoggedIn(event === 'SIGNED_IN');
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleNewReview = () => {
    if (!isLoggedIn) {
      toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
        description: "Registrati o accedi per condividere la tua esperienza"
      });
      navigate("/registrati");
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
      >
        Racconta la tua Esperienza
      </Button>
    </div>
  );
};
