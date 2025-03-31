
import { Progress } from "@/components/ui/progress";

interface LoginProgressProps {
  value: number;
}

export const LoginProgress = ({ value }: LoginProgressProps) => {
  return (
    <div className="mt-4">
      <Progress value={value} className="h-2" />
      <p className="text-xs text-center mt-1 text-muted-foreground">
        Autenticazione in corso... {Math.round(value)}%
      </p>
    </div>
  );
};
