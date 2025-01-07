import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  descrizione: z.string().optional(),
});

export default function InsertCondition() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patologia: "",
      descrizione: "",
    },
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Inserisci Patologia"));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Devi effettuare l'accesso per inserire una patologia");
        navigate("/login");
        return;
      }

      const { data: adminData } = await supabase
        .from('admin')
        .select('email')
        .eq('email', session.user.email);

      if (!adminData || adminData.length === 0) {
        toast.error("Non hai i permessi per accedere a questa pagina");
        navigate("/");
      }
    };

    checkAuth();
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
            Descrizione: values.descrizione || '',
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

              <FormField
                control={form.control}
                name="descrizione"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Inserisci una descrizione della patologia (opzionale)"
                        className="min-h-[100px]"
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