import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConditionSelect } from "@/components/form/ConditionSelect";
import { ReviewFormFields } from "./ReviewFormFields";
import { useNavigate } from "react-router-dom";
import { supabase, checkClientHealth, resetSupabaseClient } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";

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
  const [isValidatingCondition, setIsValidatingCondition] = useState(false);
  const [conditionValidated, setConditionValidated] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const submissionTimeoutRef = useRef<number | null>(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
      }
    };
  }, []);

  // Validate condition when it changes or on mount if defaultCondition is provided
  useEffect(() => {
    const validateCondition = async () => {
      const currentCondition = form.getValues("condition");
      if (!currentCondition) return;
      
      setIsValidatingCondition(true);
      setSubmissionError(null);
      
      try {
        console.log('Validating condition:', currentCondition);
        
        // Check if the client is healthy before validation
        const isHealthy = await checkClientHealth();
        if (!isHealthy) {
          await resetSupabaseClient();
        }
        
        // Check if the condition exists in the database
        const { data, error } = await supabase
          .from('PATOLOGIE')
          .select('id')
          .ilike('Patologia', currentCondition)
          .maybeSingle();
        
        if (error) {
          console.error('Error validating condition:', error);
          toast.error("Errore nella validazione della patologia. Riprova.");
          setConditionValidated(false);
        } else if (!data) {
          console.warn('Condition not found:', currentCondition);
          
          // Try a more flexible search (case insensitive)
          const { data: flexibleData, error: flexibleError } = await supabase
            .from('PATOLOGIE')
            .select('id, Patologia')
            .ilike('Patologia', `%${currentCondition}%`)
            .limit(5);
          
          if (!flexibleError && flexibleData && flexibleData.length > 0) {
            console.log('Found similar conditions:', flexibleData);
            
            // Check if there's a close enough match
            const exactMatch = flexibleData.find(
              c => c.Patologia.toLowerCase() === currentCondition.toLowerCase()
            );
            
            if (exactMatch) {
              console.log('Found exact match (case-insensitive):', exactMatch);
              form.clearErrors('condition');
              setConditionValidated(true);
              return;
            }
          }
          
          form.setError('condition', { 
            type: 'manual', 
            message: 'Patologia non trovata. Seleziona una patologia dall\'elenco.' 
          });
          setConditionValidated(false);
        } else {
          console.log('Condition validated successfully:', data);
          form.clearErrors('condition');
          setConditionValidated(true);
        }
      } catch (err) {
        console.error('Unexpected error during condition validation:', err);
        toast.error("Errore nel sistema. Riprova tra qualche minuto.");
        setConditionValidated(false);
      } finally {
        setIsValidatingCondition(false);
      }
    };

    if (form.getValues("condition")) {
      validateCondition();
    }
  }, [form, defaultCondition]);

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    
    // Reset any previous submission errors
    setSubmissionError(null);
    
    // Double check condition validity before submission
    if (!conditionValidated) {
      toast.error("È necessario selezionare una patologia valida dall'elenco");
      form.setError('condition', { 
        type: 'manual', 
        message: 'Seleziona una patologia valida dall\'elenco' 
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Starting review submission with data:', data);

      // Set a timeout to handle stalled submissions
      submissionTimeoutRef.current = window.setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionError("La richiesta ha impiegato troppo tempo. Riprova più tardi.");
        toast.error("Timeout durante l'invio della recensione. Riprova più tardi.");
      }, 20000);

      // Check client health before proceeding
      const isHealthy = await checkClientHealth();
      if (!isHealthy) {
        await resetSupabaseClient();
      }

      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error("Errore di autenticazione");
      }
      
      if (!session?.user) {
        console.error('No session found');
        throw new Error("Devi effettuare l'accesso per inviare una recensione");
      }

      console.log('User authenticated, ID:', session.user.id);

      // Get user's username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching username:', userError);
        throw new Error("Errore nel recupero dei dati utente");
      }
      
      if (!userData?.username) {
        console.error('Username not found');
        throw new Error("Username dell'utente non trovato");
      }

      console.log('Found username:', userData.username);

      // Get condition ID with error handling
      const { data: patologiaData, error: patologiaError } = await supabase
        .from('PATOLOGIE')
        .select('id')
        .ilike('Patologia', data.condition)
        .single();

      if (patologiaError) {
        console.error('Error fetching condition:', patologiaError);
        throw new Error("Errore nel recupero della patologia");
      }
      
      if (!patologiaData) {
        console.error('Condition data not found');
        throw new Error("Patologia non trovata nel database");
      }

      console.log('Found condition ID:', patologiaData.id);

      // Insert review
      const { data: insertData, error: insertError } = await supabase
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
      
      // Clear the timeout since we got a response
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
        submissionTimeoutRef.current = null;
      }
      
      if (insertError) {
        console.error('Error inserting review:', insertError);
        throw new Error(`Errore durante l'invio della recensione: ${insertError.message}`);
      }

      console.log('Review submitted successfully');
      navigate("/grazie");
      
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Clear the timeout if it exists since we got an error response
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
        submissionTimeoutRef.current = null;
      }
      
      // Handle the error, ensuring we extract the message properly regardless of error type
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Si è verificato un errore durante l'invio della recensione";
      
      // Set a specific error message for display
      setSubmissionError(errorMessage);
      
      // Show toast with error message
      toast.error(errorMessage || "Si è verificato un errore durante l'invio della recensione. Riprova più tardi.");
    } finally {
      // Make sure to reset the submitting state 
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ConditionSelect form={form} />
        {!conditionValidated && form.getValues("condition") && !isValidatingCondition && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Patologia non valida</h3>
                <div className="mt-1 text-sm text-red-700">
                  Per favore, seleziona una patologia dall'elenco delle patologie disponibili.
                </div>
              </div>
            </div>
          </div>
        )}
        
        <ReviewFormFields form={form} />
        
        {submissionError && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Errore di invio</h3>
                <div className="mt-1 text-sm text-red-700">{submissionError}</div>
              </div>
            </div>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || isValidatingCondition || !conditionValidated}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Invio in corso...</span>
              <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
            </>
          ) : isValidatingCondition ? (
            <>
              <span className="mr-2">Verifica patologia...</span>
              <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
            </>
          ) : (
            "Invia la tua esperienza"
          )}
        </Button>
      </form>
    </Form>
  );
};
