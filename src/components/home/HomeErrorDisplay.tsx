
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeErrorDisplayProps {
  error: unknown;
  refetch: () => void;
}

export const HomeErrorDisplay = ({ error, refetch }: HomeErrorDisplayProps) => {
  // Handle specific errors with helpful messages
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "Problema di autenticazione con il server. Riprova più tardi.";
      } else if (error.message.includes('timeout') || error.message.includes('scaduta')) {
        return "La richiesta è scaduta. Il server potrebbe essere momentaneamente sovraccarico.";
      } else if (error.message.includes('network') || error.message.includes('connessione')) {
        return "Problema di connessione. Verifica la tua connessione internet.";
      }
      return error.message;
    }
    return "Si è verificato un errore sconosciuto nel caricamento delle recensioni.";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive" className="mb-8">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Errore nel caricamento delle recensioni</AlertTitle>
        <AlertDescription>
          {getErrorMessage(error)}
        </AlertDescription>
      </Alert>
      
      <div className="text-center mt-8">
        <Button 
          onClick={() => refetch()} 
          className="mb-4 bg-primary text-white px-6 py-3 rounded flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-5 w-4" />
          Riprova
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Se il problema persiste, prova a ricaricare la pagina o torna più tardi.
        </p>
      </div>
    </div>
  );
};
