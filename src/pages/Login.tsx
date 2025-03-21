
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm, type LoginFormValues } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export default function Login() {
  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Login"));
  }, []);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LoginFormValues) => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    console.log("Starting login process for:", data.email);
    
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setIsLoading(false);
      toast.error("La richiesta è scaduta", {
        description: "Si è verificato un problema durante l'accesso. Riprova più tardi."
      });
    }, 10000); // Reduced to 10 seconds for faster feedback
    
    try {
      // First attempt to sign in
      console.log("Attempting login for:", data.email);
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      if (signInError) {
        console.error("Login error:", signInError);
        throw signInError;
      }

      if (!authData.user) {
        console.error("No user data received after successful login");
        throw new Error("Non è stato possibile recuperare i dati utente");
      }

      console.log("User authenticated successfully:", authData.user.email);

      // Check if user is admin after successful login
      let isAdmin = false;
      try {
        const { data: adminData } = await supabase
          .from('admin')
          .select('email')
          .eq('email', data.email);
        
        isAdmin = Array.isArray(adminData) && adminData.length > 0;
        console.log("Admin check result:", { isAdmin, adminData });
      } catch (adminError) {
        console.error("Error checking admin status:", adminError);
        // Continue with non-admin login if admin check fails
      }
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');

      toast.success(
        isAdmin ? "Benvenuto nell'area amministrazione" : "Benvenuto nel tuo account"
      );

      // Redirect to dashboard instead of home
      navigate('/dashboard');
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Error during login process:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Credenziali non valide", {
          description: "Email o password non corretti. Verifica le tue credenziali e riprova."
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error("Email non confermata", {
          description: "Per favore controlla la tua casella email e clicca sul link di conferma"
        });
      } else if (error.name === 'AbortError') {
        toast.error("Richiesta interrotta", {
          description: "La connessione ha impiegato troppo tempo. Controlla la tua connessione e riprova."
        });
      } else {
        toast.error("Errore durante il login", {
          description: error.message || "Si è verificato un errore imprevisto. Riprova più tardi."
        });
      }
    } finally {
      // Ensure isLoading is always reset to false when done
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
