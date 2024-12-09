import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BirthYearSelect } from "@/components/registration/BirthYearSelect";
import { GenderSelect } from "@/components/registration/GenderSelect";
import { Link } from "react-router-dom";

interface RegistrationFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    birthYear: string;
    gender: string;
    gdprConsent: boolean;
  }) => Promise<void>;
  isLoading: boolean;
  cooldown: number;
}

export const RegistrationForm = ({ onSubmit, isLoading, cooldown }: RegistrationFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      throw new Error("Le password non coincidono");
    }

    if (!email || !password || !birthYear || !gender) {
      throw new Error("Compila tutti i campi richiesti");
    }

    if (!gdprConsent) {
      throw new Error("Devi accettare i termini e le condizioni d'uso");
    }

    await onSubmit({ email, password, birthYear, gender, gdprConsent });
  };

  return (
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

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="gdpr" 
          checked={gdprConsent}
          onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
          disabled={isLoading || cooldown > 0}
        />
        <label
          htmlFor="gdpr"
          className="text-sm text-muted-foreground"
        >
          Acconsento al trattamento dei dati personali da parte dei Titolari, per finalità di profilazione a scopi commerciali.{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
            Privacy Policy
          </Link>
        </label>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || cooldown > 0 || !gdprConsent}
      >
        {cooldown > 0 
          ? `Riprova tra ${cooldown} secondi` 
          : (isLoading ? "Registrazione in corso..." : "Registrati")
        }
      </Button>
    </form>
  );
};