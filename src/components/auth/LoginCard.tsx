
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

interface LoginCardProps {
  children: ReactNode;
  isLoading: boolean;
}

export const LoginCard = ({ children, isLoading }: LoginCardProps) => {
  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-center mb-6">Accedi</h1>
      
      {children}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Oppure continua con
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialLoginButtons isLoading={isLoading} />
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-2 text-center text-sm">
        <Link
          to="/recupera-password"
          className="text-primary hover:underline"
        >
          Hai dimenticato la password?
        </Link>

        <p className="text-muted-foreground">
          Non hai un account?{" "}
          <Link
            to="/registrati"
            className="text-primary hover:underline"
          >
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
};
