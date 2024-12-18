import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationForm, type RegisterFormValues } from "@/components/auth/RegistrationForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Registrati"));
  }, []);

  const handleSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    console.log("Starting registration process for:", data.email);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
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

      toast.success("Registrazione completata con successo", {
        description: "Ti abbiamo inviato una email di conferma. Controlla la tua casella di posta.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Registrati</h1>
          
          <RegistrationForm onSubmit={handleSubmit} isLoading={isLoading} />

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
