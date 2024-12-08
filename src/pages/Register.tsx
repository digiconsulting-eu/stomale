import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { BirthYearSelect } from "@/components/registration/BirthYearSelect";
import { GenderSelect } from "@/components/registration/GenderSelect";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldown > 0) {
      toast.error(`Attendi ${cooldown} secondi prima di riprovare`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    if (!email || !password || !birthYear || !gender) {
      toast.error("Compila tutti i campi richiesti");
      return;
    }

    setIsLoading(true);

    try {
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

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Registrati</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="La tua email"
              disabled={isLoading || cooldown > 0}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Scegli una password"
              disabled={isLoading || cooldown > 0}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Conferma Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Conferma la password"
              disabled={isLoading || cooldown > 0}
            />
          </div>

          <BirthYearSelect 
            value={birthYear} 
            onChange={setBirthYear} 
            disabled={isLoading || cooldown > 0} 
          />
          <GenderSelect 
            value={gender} 
            onChange={setGender} 
            disabled={isLoading || cooldown > 0} 
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || cooldown > 0}
          >
            {cooldown > 0 
              ? `Riprova tra ${cooldown} secondi` 
              : (isLoading ? "Registrazione in corso..." : "Registrati")
            }
          </Button>
        </form>

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