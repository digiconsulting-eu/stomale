import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { setPageTitle } from "@/utils/pageTitle";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("Benvenuto su Stomale.info");
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Benvenuto su Stomale.info!
        </h1>
        
        <p className="text-lg text-gray-600 mb-12">
          Grazie per esserti registrato. Ora puoi iniziare a esplorare le patologie o condividere la tua esperienza.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Button 
            onClick={() => navigate('/cerca-patologia')}
            className="h-32 text-xl"
          >
            Cerca Patologia
          </Button>

          <Button 
            onClick={() => navigate('/nuova-recensione')}
            className="h-32 text-xl"
          >
            Racconta la tua Esperienza
          </Button>
        </div>
      </div>
    </div>
  );
}