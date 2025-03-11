
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StarRatingField } from "@/components/form/StarRatingField";
import { UseFormReturn } from "react-hook-form";

interface ReviewFormFieldsProps {
  form: UseFormReturn<any>;
}

export const ReviewFormFields = ({ form }: ReviewFormFieldsProps) => {
  const hasDrugTreatment = form.watch("hasDrugTreatment");

  return (
    <>
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
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 rounded-md border border-[#0EA5E9] p-3 bg-[#0EA5E9]/5">
                  <RadioGroupItem id="yes" value="yes" className="border-[#0EA5E9]" />
                  <Label htmlFor="yes" className="flex-1 cursor-pointer font-medium">Sì</Label>
                </div>
                <div className="flex items-center space-x-3 rounded-md border border-[#0EA5E9] p-3 bg-[#0EA5E9]/5">
                  <RadioGroupItem id="no" value="no" className="border-[#0EA5E9]" />
                  <Label htmlFor="no" className="flex-1 cursor-pointer font-medium">No</Label>
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
    </>
  );
};
