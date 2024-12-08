import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { checkUserExists } from "@/utils/auth";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(12);
    const cooldownInterval = setInterval(() => {
      setCooldown((prevCooldown) => {
        if (prevCooldown <= 1) {
          clearInterval(cooldownInterval);
          return 0;
        }
        return prevCooldown - 1;
      });
    }, 1000);
  };

  const handleSubmit = async ({ email, password, birthYear, gender }: {
    email: string;
    password: string;
    birthYear: string;
    gender: string;
  }) => {
    if (cooldown > 0) {
      toast.error(`Attendi ${cooldown} secondi prima di riprovare`);
      return;
    }

    setIsLoading(true);
    console.log("Starting registration process for:", email);

    try {
      // Check if user exists first
      const userExists = await checkUserExists(email);
      if (userExists) {
        toast.error("Un account con questa email esiste già. Prova ad accedere.");
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            birth_year: birthYear,
            gender: gender,
          },
        },
      });

      if (error) {
        console.error('Registration error:', error);
        if (error.message.includes("rate limit")) {
          startCooldown();
        }
        throw error;
      }

      if (data.user) {
        toast.success("Registrazione completata con successo!");
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error(error.message || "Si è verificato un errore durante la registrazione");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
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
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-text-light">
                Oppure continua con
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Google
            </Button>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Facebook
            </Button>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              LinkedIn
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link to="/recupera-password" className="text-primary hover:underline">
            Hai dimenticato la password?
          </Link>
        </div>

        <div className="mt-4 text-center text-sm">
          Hai già un account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Accedi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;