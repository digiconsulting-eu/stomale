
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Racconta la tua Esperienza"));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        console.log("Checking authentication status...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          throw error;
        }
        
        if (!session) {
          console.log("No active session found, redirecting to registration");
          toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
            description: "Registrati o accedi per condividere la tua esperienza"
          });
          navigate("/registrati");
          return;
        }
        
        console.log("User is authenticated:", session.user.id);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Authentication check failed:", err);
        toast.error("Si è verificato un errore nel controllo dell'autenticazione");
        navigate("/registrati");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to registration");
        toast.error("Devi effettuare l'accesso per raccontare la tua esperienza");
        navigate("/registrati");
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session) {
        console.log("User signed in:", session.user.id);
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
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
