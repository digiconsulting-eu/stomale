import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DescriptionsImport = () => {
  const [isLoadingDescriptions, setIsLoadingDescriptions] = useState(false);

  const handleDescriptionsFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingDescriptions(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("Il file è vuoto");
        return;
      }

      const errors: string[] = [];
      const updates = [];

      for (const [index, row] of jsonData.entries()) {
        const condition = row['Patologia'];
        const description = row['Descrizione'];

        if (!condition || !description) {
          errors.push(`Riga ${index + 2}: Manca la patologia o la descrizione`);
          continue;
        }

        updates.push({
          Patologia: condition.toUpperCase(),
          Descrizione: description
        });
      }

      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }

      if (updates.length > 0) {
        for (const update of updates) {
          const { error } = await supabase
            .from('PATOLOGIE')
            .upsert(update, {
              onConflict: 'patologia_unique'
            });

          if (error) {
            console.error('Errore Supabase:', error);
            toast.error(`Errore durante il salvataggio di ${update.Patologia}`);
            return;
          }
        }

        toast.success(`${updates.length} descrizioni importate con successo`);
      }

    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast.error("Si è verificato un errore durante l'importazione del file");
    } finally {
      setIsLoadingDescriptions(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-medium mb-2">Istruzioni per l'importazione delle descrizioni</h3>
        <p className="text-sm text-muted-foreground">
          Il file Excel deve contenere due colonne:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
          <li>Colonna "Patologia": nome della patologia</li>
          <li>Colonna "Descrizione": descrizione della patologia</li>
        </ul>
      </div>

      <Button
        variant="outline"
        className="relative"
        disabled={isLoadingDescriptions}
      >
        {isLoadingDescriptions && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Seleziona File Excel
        <input
          type="file"
          accept=".xlsx"
          onChange={handleDescriptionsFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </Button>
    </div>
  );
};