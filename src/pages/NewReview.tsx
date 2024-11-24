import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio").max(200, "Il titolo non può superare i 200 caratteri"),
  condition: z.string().min(1, "Seleziona una patologia"),
  symptoms: z.string().min(1, "Descrivi i sintomi che hai avuto"),
  experience: z.string().min(1, "Racconta la tua esperienza"),
  diagnosisDifficulty: z.number().min(1).max(5),
  symptomsDiscomfort: z.number().min(1).max(5),
  hasDrugTreatment: z.boolean(),
  drugTreatmentEffectiveness: z.number().optional(),
  healingPossibility: z.number().min(1).max(5),
  socialDiscomfort: z.number().min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewReview() {
  const [showDrugEffectiveness, setShowDrugEffectiveness] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      condition: "",
      symptoms: "",
      experience: "",
      diagnosisDifficulty: 0,
      symptomsDiscomfort: 0,
      hasDrugTreatment: false,
      drugTreatmentEffectiveness: 0,
      healingPossibility: 0,
      socialDiscomfort: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    toast.success("La tua esperienza è stata inviata con successo!");
  };

  // Mock data for conditions - replace with actual data
  const conditions = [
    "Acne",
    "Allergie",
    "Asma",
    "Cefalea",
    "Diabete",
    // ... add more conditions
  ];

  return (
    <div className="container max-w-3xl py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-primary">Racconta la tua Esperienza</h1>
      
      <div className="card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci un titolo (max 200 caratteri)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patologia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una patologia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quali sintomi hai avuto?</FormLabel>
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
                  <FormLabel>Raccontaci la tua esperienza</FormLabel>
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

            <FormField
              control={form.control}
              name="diagnosisDifficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficoltà di Diagnosi</FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptomsDiscomfort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quanto sono fastidiosi i sintomi?</FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasDrugTreatment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Cura Farmacologica</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setShowDrugEffectiveness(checked);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {showDrugEffectiveness && (
              <FormField
                control={form.control}
                name="drugTreatmentEffectiveness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Efficacia cura farmacologica</FormLabel>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="healingPossibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Possibilità di guarigione</FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialDiscomfort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disagio sociale</FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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