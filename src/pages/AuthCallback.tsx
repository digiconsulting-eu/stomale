
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Autenticazione"));
    
    const handleAuthCallback = async () => {
      // The hash contains the token
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error in auth callback:", error);
        toast.error("Errore durante l'autenticazione", {
          description: error.message
        });
        navigate('/login');
        return;
      }

      if (data.session) {
        console.log("Authentication successful in callback page");
        toast.success("Autenticazione completata con successo");
        navigate('/dashboard', { replace: true });
      } else {
        console.log("No session found in callback page");
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Completamento dell'autenticazione in corso...</p>
      </div>
    </div>
  );
}
