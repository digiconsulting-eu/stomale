import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { BirthYearSelect } from "@/components/registration/BirthYearSelect";
import { GenderSelect } from "@/components/registration/GenderSelect";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    try {
      const registrationNumber = getNextRegistrationNumber();
      const username = `Anonimo ${registrationNumber}`;

      localStorage.setItem(`user_${registrationNumber}`, JSON.stringify({
        username,
        email,
        registrationNumber,
        birthYear,
        gender,
        joinDate: new Date().toISOString()
      }));

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

  const getNextRegistrationNumber = () => {
    const users = Object.keys(localStorage)
      .filter(key => key.startsWith('user_'))
      .map(key => {
        const userData = JSON.parse(localStorage.getItem(key) || '{}');
        return parseInt(userData.registrationNumber || '0');
      });

    return users.length === 0 ? 1 : Math.max(...users) + 1;
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

          <BirthYearSelect value={birthYear} onChange={setBirthYear} />
          <GenderSelect value={gender} onChange={setGender} />

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