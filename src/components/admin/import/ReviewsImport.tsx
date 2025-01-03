import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2, Trash2 } from "lucide-react";
import { ImportInstructions } from "./ImportInstructions";
import { validateRow } from "./ImportValidator";
import { ConfirmDialog } from "../../ConfirmDialog";
import { supabase } from "@/integrations/supabase/client";

export const ReviewsImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    console.log('Starting file upload process...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("Il file è vuoto");
        return;
      }

      console.log(`Processing ${jsonData.length} rows...`);
      const validReviews = [];
      const errors = [];

      for (const [index, row] of jsonData.entries()) {
        try {
          console.log(`Validating row ${index + 1}:`, row);
          const validatedRow = await validateRow(row);
          
          if (validatedRow) {
            console.log(`Inserting review for condition ID ${validatedRow.condition_id}`);
            const { error: insertError } = await supabase
              .from('reviews')
              .insert({
                condition_id: validatedRow.condition_id,
                title: validatedRow.title,
                symptoms: validatedRow.symptoms,
                experience: validatedRow.experience,
                diagnosis_difficulty: validatedRow.diagnosis_difficulty,
                symptoms_severity: validatedRow.symptoms_severity,
                has_medication: validatedRow.has_medication,
                medication_effectiveness: validatedRow.medication_effectiveness,
                healing_possibility: validatedRow.healing_possibility,
                social_discomfort: validatedRow.social_discomfort,
                created_at: validatedRow.created_at,
                status: validatedRow.status,
                user_id: validatedRow.user_id
              });

            if (insertError) {
              console.error('Errore di inserimento:', insertError);
              errors.push(`Riga ${index + 2}: Errore durante l'inserimento nel database: ${insertError.message}`);
            } else {
              validReviews.push(validatedRow);
              console.log(`Successfully inserted review for row ${index + 1}`);
            }
          }
        } catch (error) {
          console.error(`Error processing row ${index + 1}:`, error);
          errors.push(`Riga ${index + 2}: ${(error as Error).message}`);
        }
      }

      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        errors.forEach(error => toast.error(error));
      }

      if (validReviews.length > 0) {
        toast.success(
          `${validReviews.length} recensioni importate con successo${
            errors.length > 0 ? `. ${errors.length} recensioni ignorate per errori.` : '.'
          }`
        );
      } else {
        toast.error("Nessuna recensione valida trovata nel file.");
      }
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast.error("Si è verificato un errore durante l'importazione del file.");
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleClearImportedReviews = async () => {
    try {
      console.log('Attempting to clear imported reviews...');
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('status', 'approved');

      if (error) {
        console.error('Error clearing reviews:', error);
        throw error;
      }

      console.log('Successfully cleared imported reviews');
      toast.success("Tutte le recensioni importate sono state eliminate con successo");
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.error("Si è verificato un errore durante l'eliminazione delle recensioni");
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6">
      <ImportInstructions />
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="relative"
          disabled={isLoading}
        >
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Seleziona File Excel
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </Button>

        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Elimina recensioni importate
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleClearImportedReviews}
        title="Elimina recensioni importate"
        description="Sei sicuro di voler eliminare tutte le recensioni importate? Questa azione non può essere annullata."
      />
    </div>
  );
};