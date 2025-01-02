import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ReviewErrorProps {
  message: string;
}

export const ReviewError = ({ message }: ReviewErrorProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};