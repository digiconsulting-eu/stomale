
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
        console.log("Checking auth status...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session found, redirecting to login");
          toast.error("Devi effettuare l'accesso per inserire una patologia");
          navigate("/login");
          return;
        }

        console.log("Session found, checking admin status...");

        // Check if user is admin
        const { data: isAdmin, error: isAdminError } = await supabase
          .rpc('is_admin');

        if (isAdminError) {
          console.error("Admin check error:", isAdminError);
          throw isAdminError;
        }

        console.log("Admin status:", isAdmin);

        if (!isAdmin) {
          console.log("User is not admin, redirecting to home");
          toast.error("Non hai i permessi per accedere a questa pagina");
          navigate("/");
          return;
        }

        console.log("Auth check completed successfully");
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Si è verificato un errore durante il controllo dei permessi");
        navigate("/");
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
      
    } catch (error) {
      console.error("Error in submission:", error);
      toast.error("Si è verificato un errore durante l'inserimento");
    } finally {
      setIsSubmitting(false);
    }
  };

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
