
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewActionsProps {
  condition: string;
}

export const ReviewActions = ({ condition }: ReviewActionsProps) => {
  const conditionName = capitalizeFirstLetter(condition);
  const formattedCondition = condition.toLowerCase(); // Mantenendo gli spazi originali
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
  
  const handleNewReview = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
        description: "Registrati o accedi per condividere la tua esperienza"
      });
      navigate("/registrati");
    }
  };
  
  return (
    <div className="mb-8">
      {/* Mobile: solo testo */}
      <div className="block md:hidden">
        <Link 
          to={`/nuova-recensione?patologia=${formattedCondition}`}
          className="block text-xl font-semibold text-primary hover:text-primary-hover text-center"
          onClick={handleNewReview}
        >
          Racconta la tua Esperienza con {conditionName}
        </Link>
      </div>

      {/* Desktop: pulsante */}
      <div className="hidden md:block">
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
      </div>
    </div>
  );
};
