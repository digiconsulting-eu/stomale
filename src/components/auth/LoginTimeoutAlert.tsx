
import { AlertTriangle, RefreshCw, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface LoginTimeoutAlertProps {
  onReset: () => void;
  onForceReset: () => void;
}

export const LoginTimeoutAlert = ({ onReset, onForceReset }: LoginTimeoutAlertProps) => {
  return (
    <div className="mb-6 text-center">
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Timeout di autenticazione</AlertTitle>
        <AlertDescription>
          La richiesta di login ha impiegato troppo tempo. Il server potrebbe essere sovraccarico al momento.
        </AlertDescription>
      </Alert>
      <div className="flex flex-col space-y-2">
        <Button 
          onClick={onReset}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Ripristina e riprova
        </Button>
        <Button 
          onClick={onForceReset}
          variant="outline" 
          className="px-4 py-2 rounded-md"
        >
          <Database className="h-4 w-4 mr-2" />
          Ripristino forzato
        </Button>
      </div>
    </div>
  );
};
