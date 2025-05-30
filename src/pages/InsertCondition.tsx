
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  patologia: z.string().min(2, {
    message: "La patologia deve contenere almeno 2 caratteri",
  }),
});

export default function InsertCondition() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patologia: "",
    },
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Inserisci Patologia"));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          if (isMounted) {
            toast.error("Errore nel verificare l'autenticazione");
            navigate("/login", { replace: true });
          }
          return;
        }

        if (!session) {
          console.log("No session found, redirecting to login");
          if (isMounted) {
            toast.error("Devi effettuare l'accesso per inserire una patologia");
            navigate("/login", { replace: true });
          }
          return;
        }

        // User is authenticated, store session and allow access
        if (isMounted) {
          setCurrentSession(session);
          setIsAuthenticated(true);
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Error checking auth status:", error);
        if (isMounted) {
          toast.error("Si è verificato un errore durante il controllo dell'autenticazione");
          navigate("/login", { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentSession) {
      toast.error("Devi effettuare l'accesso per inserire una patologia");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting condition:", values);

      const { data, error } = await supabase
        .from('PATOLOGIE')
        .insert([
          {
            Patologia: values.patologia.toUpperCase(),
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error inserting condition:", error);
        toast.error("Errore durante l'inserimento della patologia");
        return;
      }

      console.log("Condition inserted successfully:", data);
      toast.success("Patologia inserita con successo");
      form.reset();
      
      // Reindirizza alla pagina della patologia appena creata
      const conditionSlug = values.patologia.trim().toLowerCase();
      navigate(`/patologia/${conditionSlug}`);
      
    } catch (error) {
      console.error("Error in submission:", error);
      toast.error("Si è verificato un errore durante l'inserimento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Inserisci una nuova patologia
        </h1>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patologia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Patologia *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci il nome della patologia" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Inserimento in corso..." : "Inserisci Patologia"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
