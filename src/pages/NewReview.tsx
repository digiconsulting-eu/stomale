import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConditionSelect } from "@/components/form/ConditionSelect";
import { StarRatingField } from "@/components/form/StarRatingField";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

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

export default function NewReview() {
  const [searchParams] = useSearchParams();
  const conditionParam = searchParams.get("condition");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition: conditionParam || "",
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

  useEffect(() => {
    if (conditionParam) {
      form.setValue("condition", conditionParam);
    }
  }, [conditionParam, form]);

  const hasDrugTreatment = form.watch("hasDrugTreatment");

  const onSubmit = (data: FormValues) => {
    console.log(data);
    toast.success("La tua esperienza è stata inviata con successo!");
  };

  return (
    <div className="container max-w-3xl py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-primary">Racconta la tua Esperienza</h1>
      
      <div className="card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConditionSelect form={form} />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci un titolo (max 200 caratteri)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quali sintomi hai avuto? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi i sintomi che hai avuto..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raccontaci la tua esperienza *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Quali cure hai fatto o stai facendo? Sei riuscito a guarire?"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <StarRatingField
              form={form}
              name="diagnosisDifficulty"
              label="Difficoltà di Diagnosi *"
            />

            <StarRatingField
              form={form}
              name="symptomsDiscomfort"
              label="Quanto sono fastidiosi i sintomi? *"
            />

            <FormField
              control={form.control}
              name="hasDrugTreatment"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Hai fatto o stai facendo una cura farmacologica? *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">Sì</Label>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasDrugTreatment === "yes" && (
              <StarRatingField
                form={form}
                name="drugTreatmentEffectiveness"
                label="Efficacia cura farmacologica *"
              />
            )}

            <StarRatingField
              form={form}
              name="healingPossibility"
              label="Possibilità di guarigione *"
            />

            <StarRatingField
              form={form}
              name="socialDiscomfort"
              label="Disagio sociale *"
            />

            <Button type="submit" className="w-full">
              Invia la tua esperienza
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}