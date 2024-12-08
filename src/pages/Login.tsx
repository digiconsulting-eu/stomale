import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm, type LoginFormValues } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        if (signInError.message === "Email not confirmed") {
          toast({
            title: "Email non confermata",
            description: "Per favore controlla la tua email e clicca sul link di conferma prima di accedere. Se non hai ricevuto l'email, controlla la cartella spam.",
            variant: "destructive",
          });
          return;
        }
        throw signInError;
      }

      if (authData.user) {
        const { data: userData } = await supabase
          .from('admin')
          .select('email')
          .eq('email', data.email)
          .single();

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', userData ? 'true' : 'false');

        toast({
          title: "Login effettuato con successo",
          description: userData ? "Benvenuto nell'area amministrazione" : "Benvenuto nel tuo account",
        });

        navigate(userData ? '/admin' : '/dashboard');
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        title: "Errore di autenticazione",
        description: "Email o password non corretti",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Accedi</h1>
          
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

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
      </div>
    </div>
  );
}