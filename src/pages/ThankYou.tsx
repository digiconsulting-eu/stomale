
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { setPageTitle } from "@/utils/pageTitle";

export default function ThankYou() {
  useEffect(() => {
    setPageTitle("Grazie per la tua Esperienza");
  }, []);

  return (
    <div className="container max-w-3xl py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-primary">
          Grazie per aver condiviso la tua esperienza!
        </h1>
        
        <p className="text-lg text-gray-600">
          La tua recensione è stata inviata con successo e sarà pubblicata dopo essere stata revisionata.
          Nel frattempo, puoi continuare a esplorare il sito:
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link to="/cerca-patologia">
            <Button className="w-full sm:w-auto text-white">
              Cerca una Patologia
            </Button>
          </Link>
          
          <Link to="/nuova-recensione">
            <Button className="w-full sm:w-auto text-white">
              Racconta un'altra Esperienza
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
