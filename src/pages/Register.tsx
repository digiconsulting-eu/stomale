import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    try {
      // Simulate API call to get next registration number
      const registrationNumber = Math.floor(Math.random() * 1000) + 1;
      const username = `Anonimo ${registrationNumber}`;

      // Store user data
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('registrationNumber', registrationNumber.toString());
      localStorage.setItem('email', email);
      localStorage.setItem('joinDate', new Date().toISOString());

      toast.success("Registrazione completata con successo!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Si è verificato un errore durante la registrazione");
    }
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
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="birthYear" className="text-sm font-medium">
              Anno di Nascita
            </label>
            <Select value={birthYear} onValueChange={setBirthYear}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona anno" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="text-sm font-medium">
              Sesso
            </label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona sesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Maschio</SelectItem>
                <SelectItem value="F">Femmina</SelectItem>
                <SelectItem value="O">Altro</SelectItem>
                <SelectItem value="N">Preferisco non specificare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Registrati
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
            <Button variant="outline" className="w-full">
              Google
            </Button>
            <Button variant="outline" className="w-full">
              Facebook
            </Button>
            <Button variant="outline" className="w-full">
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