import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export default function InsertCondition() {
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Inserisci Patologia"));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Devi effettuare l'accesso per inserire una patologia");
        navigate("/login");
        return;
      }

      const { data: adminData } = await supabase
        .from('admin')
        .select('email')
        .eq('email', session.user.email);

      if (!adminData || adminData.length === 0) {
        toast.error("Non hai i permessi per accedere a questa pagina");
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Inserisci una nuova patologia
        </h1>
        
        <div className="card">
          <form className="space-y-6">
            {/* Form fields will be added here */}
            <p className="text-center text-gray-500">
              Funzionalità in sviluppo
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}