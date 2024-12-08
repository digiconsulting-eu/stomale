import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BirthYearSelect } from "@/components/registration/BirthYearSelect";
import { GenderSelect } from "@/components/registration/GenderSelect";

interface RegistrationFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    birthYear: string;
    gender: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      throw new Error("Le password non coincidono");
    }

    if (!email || !password || !birthYear || !gender) {
      throw new Error("Compila tutti i campi richiesti");
    }

    await onSubmit({ email, password, birthYear, gender });
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
  );
};