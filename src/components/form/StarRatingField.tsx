
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { StarRating } from "@/components/StarRating";
import { UseFormReturn } from "react-hook-form";

interface StarRatingFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
}

export const StarRatingField = ({ form, name, label }: StarRatingFieldProps) => {
  const [value, setValue] = useState<number>(form.getValues(name) || 0);
  
  // Sync the internal state with form values
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === name) {
        setValue(value[name] || 0);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, name]);

  const handleChange = (newValue: number) => {
    console.log(`Changing ${name} value to:`, newValue);
    setValue(newValue);
    form.setValue(name, newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div>
              <StarRating
                value={value}
                onChange={handleChange}
                className="py-2"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
