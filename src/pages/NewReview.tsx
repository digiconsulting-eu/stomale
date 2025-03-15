
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ReviewForm } from "@/components/review/ReviewForm";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { supabase } from "@/integrations/supabase/client";

export default function NewReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conditionParam = searchParams.get("patologia");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Racconta la tua Esperienza"));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Checking authentication status...");
        
        // Force refresh the session to ensure we have the latest state
        await supabase.auth.refreshSession();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
            description: "Registrati o accedi per condividere la tua esperienza"
          });
          navigate("/registrati");
          return;
        }
        
        console.log("User is authenticated, session valid");
      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("Errore durante la verifica dell'accesso");
        navigate("/registrati");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in NewReview:", event);
      
      if (event === 'SIGNED_OUT') {
        toast.error("Devi effettuare l'accesso per raccontare la tua esperienza");
        navigate("/registrati");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-8 space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Verifica accesso in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-primary">
        Racconta la tua Esperienza
      </h1>
      
      <div className="card">
        <ReviewForm defaultCondition={conditionParam || ""} />
      </div>
    </div>
  );
}
