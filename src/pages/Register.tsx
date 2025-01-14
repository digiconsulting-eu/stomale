import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Registrati"));

    // Set up auth state listener for registration completion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN') {
        console.log("User signed in, redirecting to welcome page...");
        toast.success("Registrazione completata con successo");
        navigate('/welcome', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (data: {
    email: string;
    password: string;
    birthYear: string;
    gender: string;
    gdprConsent: boolean;
  }) => {
    setIsLoading(true);
    console.log("Starting registration process for:", data.email);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            birth_year: data.birthYear,
            gender: data.gender,
          },
        },
      });

      if (signUpError) {
        console.error("Registration error:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        console.error("No user data received after successful registration");
        throw new Error("Non è stato possibile completare la registrazione");
      }

      console.log("User registered successfully:", authData.user.email);
      
      // Note: The redirect will be handled by the auth state listener above
      toast.success("Registrazione completata con successo", {
        description: "Ti abbiamo inviato una email di conferma. Controlla la tua casella di posta.",
      });

    } catch (error: any) {
      console.error('Error during registration process:', error);
      
      if (error.message.includes('User already registered')) {
        toast.error("Email già registrata", {
          description: "Questa email è già associata a un account esistente"
        });
      } else {
        toast.error("Errore durante la registrazione", {
          description: error.message
        });
      }
      
      // Set cooldown when an error occurs
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Registrati</h1>
          
          <RegistrationForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            cooldown={cooldown}
          />

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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline"
            >
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}