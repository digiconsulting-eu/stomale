
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ReviewForm } from "@/components/review/ReviewForm";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { supabase } from "@/integrations/supabase/client";

export default function NewReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conditionParam = searchParams.get("patologia");

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Racconta la tua Esperienza"));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
          description: "Registrati o accedi per condividere la tua esperienza"
        });
        navigate("/registrati");
        return;
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        toast.error("Devi effettuare l'accesso per raccontare la tua esperienza");
        navigate("/registrati");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
