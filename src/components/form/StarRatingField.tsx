
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StarRating } from "@/components/StarRating";
import { UseFormReturn } from "react-hook-form";

interface StarRatingFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
}

export const StarRatingField = ({ form, name, label }: StarRatingFieldProps) => {
  // Add explicit console logging to debug values
  const value = form.watch(name);
  console.log(`Star rating field "${name}" current value:`, value);
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <StarRating
              value={field.value}
              onChange={(newValue) => {
                console.log(`Changing ${name} from ${field.value} to ${newValue}`);
                field.onChange(newValue);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
