import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Facebook, Linkedin } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (authData.user) {
        const { data: userData } = await supabase
          .from('admin')
          .select('email')
          .eq('email', data.email)
          .single();

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', userData ? 'true' : 'false');

        toast({
          title: "Login effettuato con successo",
          description: userData ? "Benvenuto nell'area amministrazione" : "Benvenuto nel tuo account",
        });

        navigate(userData ? '/admin' : '/dashboard');
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        title: "Errore di autenticazione",
        description: "Email o password non corretti",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Accedi</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nome@esempio.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Link
                  to="/recupera-password"
                  className="text-sm text-primary hover:underline"
                >
                  Hai dimenticato la password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full border border-primary"
                disabled={isLoading}
              >
                {isLoading ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>
          </Form>

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

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {/* TODO: Implement Google login */}}
              >
                <FcGoogle className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {/* TODO: Implement Facebook login */}}
              >
                <Facebook className="h-5 w-5 text-blue-600" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {/* TODO: Implement LinkedIn login */}}
              >
                <Linkedin className="h-5 w-5 text-blue-700" />
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
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
  );
}