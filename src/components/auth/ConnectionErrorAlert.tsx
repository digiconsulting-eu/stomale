
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ConnectionErrorAlertProps {
  onReset: () => void;
}

export const ConnectionErrorAlert = ({ onReset }: ConnectionErrorAlertProps) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Problema di connessione</AlertTitle>
      <AlertDescription>
        Impossibile contattare il server di autenticazione. Prova a ricaricare la pagina.
      </AlertDescription>
      <Button 
        onClick={onReset}
        variant="outline" 
        size="sm"
        className="mt-2 w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Ricarica la pagina
      </Button>
    </Alert>
  );
};
