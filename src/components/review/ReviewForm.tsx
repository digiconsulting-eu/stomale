
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConditionSelect } from "@/components/form/ConditionSelect";
import { ReviewFormFields } from "./ReviewFormFields";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  condition: z.string().min(1, "Seleziona una patologia"),
  title: z.string().min(1, "Il titolo è obbligatorio").max(200, "Il titolo non può superare i 200 caratteri"),
  symptoms: z.string().min(1, "Descrivi i sintomi che hai avuto"),
  experience: z.string().min(1, "Racconta la tua esperienza"),
  diagnosisDifficulty: z.number().min(1, "Valutazione obbligatoria").max(5),
  symptomsDiscomfort: z.number().min(1, "Valutazione obbligatoria").max(5),
  hasDrugTreatment: z.string().min(1, "Seleziona una risposta"),
  drugTreatmentEffectiveness: z.number().optional(),
  healingPossibility: z.number().min(1, "Valutazione obbligatoria").max(5),
  socialDiscomfort: z.number().min(1, "Valutazione obbligatoria").max(5),
});

type FormValues = z.infer<typeof formSchema>;

export const ReviewForm = ({ defaultCondition = "" }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setCheckingAuth(true);
        console.log("Checking authentication status in ReviewForm...");
        
        // Force refresh the session to ensure we have the latest state
        await supabase.auth.refreshSession();
        const { data: { session } } = await supabase.auth.getSession();
        
        setIsAuthenticated(!!session);
        console.log("User is authenticated:", !!session);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition: defaultCondition,
      title: "",
      symptoms: "",
      experience: "",
      diagnosisDifficulty: 0,
      symptomsDiscomfort: 0,
      hasDrugTreatment: "",
      drugTreatmentEffectiveness: 0,
      healingPossibility: 0,
      socialDiscomfort: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('Starting review submission with data:', data);

      // Force refresh the session to ensure we have the latest state
      await supabase.auth.refreshSession();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Session error:', sessionError);
        toast.error("Devi effettuare l'accesso per inviare una recensione");
        navigate("/login", { state: { returnTo: "/nuova-recensione" } });
        return;
      }

      // Get user's username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching username:', userError);
        toast.error("Errore nel recupero dei dati utente");
        return;
      }

      if (!userData?.username) {
        console.error('No username found for user:', session.user.id);
        toast.error("Username non trovato per questo utente");
        return;
      }

      console.log('Found username:', userData.username);

      // Get condition ID - use case-insensitive matching with ilike
      const { data: patologiaData, error: patologiaError } = await supabase
        .from('PATOLOGIE')
        .select('id')
        .ilike('Patologia', data.condition)
        .maybeSingle();

      if (patologiaError) {
        console.error('Error fetching condition:', patologiaError);
        toast.error("Errore nel recupero della patologia");
        return;
      }

      if (!patologiaData) {
        console.error('No condition found for:', data.condition);
        toast.error(`Patologia "${data.condition}" non trovata`);
        return;
      }

      console.log('Found condition ID:', patologiaData.id);

      // Insert review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert([
          {
            username: userData.username,
            condition_id: patologiaData.id,
            title: data.title,
            symptoms: data.symptoms,
            experience: data.experience,
            diagnosis_difficulty: data.diagnosisDifficulty,
            symptoms_severity: data.symptomsDiscomfort,
            has_medication: data.hasDrugTreatment === 'yes',
            medication_effectiveness: data.hasDrugTreatment === 'yes' ? data.drugTreatmentEffectiveness : null,
            healing_possibility: data.healingPossibility,
            social_discomfort: data.socialDiscomfort,
            status: 'pending'
          }
        ]);

      if (reviewError) {
        console.error('Error inserting review:', reviewError);
        throw reviewError;
      }

      console.log('Review submitted successfully');
      toast.success("Recensione inviata con successo!");
      navigate("/grazie");
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Si è verificato un errore durante l'invio della recensione. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifica autenticazione...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-lg">Devi effettuare l'accesso per inviare una recensione.</p>
        <Button 
          onClick={() => navigate("/login", { state: { returnTo: "/nuova-recensione" } })} 
          className="mx-auto"
        >
          Accedi
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ConditionSelect form={form} />
        <ReviewFormFields form={form} />
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invio in corso...
            </>
          ) : "Invia la tua esperienza"}
        </Button>
      </form>
    </Form>
  );
};
