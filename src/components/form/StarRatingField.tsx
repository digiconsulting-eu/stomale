import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StarRating } from "@/components/StarRating";
import { UseFormReturn } from "react-hook-form";

interface StarRatingFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
}

export const StarRatingField = ({ form, name, label }: StarRatingFieldProps) => {
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
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};