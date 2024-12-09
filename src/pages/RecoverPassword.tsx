import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setIsSent(true);
      toast.success("Email di recupero inviata", {
        description: "Controlla la tua casella email per le istruzioni"
      });

    } catch (error: any) {
      console.error('Error during password recovery:', error);
      toast.error("Errore durante il recupero password", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">
          Recupera Password
        </h1>

        {!isSent ? (
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
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Invio in corso..." : "Invia email di recupero"}
            </Button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">
                Torna al login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-text">
              Abbiamo inviato le istruzioni per il recupero password alla tua email.
            </p>
            <p className="text-text-light text-sm">
              Non hai ricevuto l'email?{" "}
              <button
                onClick={() => setIsSent(false)}
                className="text-primary hover:underline"
              >
                Riprova
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}