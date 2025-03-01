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
    try {
      console.log('Starting review submission with data:', data);

      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Session error:', sessionError);
        toast.error("Devi effettuare l'accesso per inviare una recensione");
        navigate("/login");
        return;
      }

      // Get user's username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData?.username) {
        console.error('Error fetching username:', userError);
        toast.error("Errore nel recupero dei dati utente");
        return;
      }

      console.log('Found username:', userData.username);

      // Get condition ID
      const { data: patologiaData, error: patologiaError } = await supabase
        .from('PATOLOGIE')
        .select('id')
        .eq('Patologia', data.condition.toUpperCase())
        .single();

      if (patologiaError || !patologiaData) {
        console.error('Error fetching condition:', patologiaError);
        toast.error("Errore nel recupero della patologia");
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
      navigate("/grazie");
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Si è verificato un errore durante l'invio della recensione. Riprova più tardi.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ConditionSelect form={form} />
        <ReviewFormFields form={form} />
        <Button type="submit" className="w-full">
          Invia la tua esperienza
        </Button>
      </form>
    </Form>
  );
};