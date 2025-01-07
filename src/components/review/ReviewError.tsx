import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ReviewErrorProps {
  message: string;
}

export const ReviewError = ({ message }: ReviewErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button 
        onClick={() => navigate(-1)}
        variant="outline"
        className="mt-4"
      >
        Torna indietro
      </Button>
    </div>
  );
};