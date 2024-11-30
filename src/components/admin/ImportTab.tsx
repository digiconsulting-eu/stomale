import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2, Trash2 } from "lucide-react";
import { ImportInstructions } from "./import/ImportInstructions";
import { validateRow } from "./import/ImportValidator";
import { ConfirmDialog } from "../ConfirmDialog";

const ImportTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Dati Excel importati:', jsonData);

      if (jsonData.length === 0) {
        toast.error("Il file è vuoto");
        return;
      }

      const validReviews = [];
      const errors = [];

      for (const [index, row] of jsonData.entries()) {
        try {
          const validatedRow = validateRow(row);
          if (validatedRow) {
            validReviews.push(validatedRow);
          }
        } catch (error) {
          errors.push(`Riga ${index + 2}: ${(error as Error).message}`);
        }
      }

      if (errors.length > 0) {
        console.error('Errori di validazione:', errors);
        errors.forEach(error => toast.error(error));
      }

      if (validReviews.length > 0) {
        // Get existing reviews from localStorage
        const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        
        // Add new reviews
        const updatedReviews = [...existingReviews, ...validReviews];
        
        // Sort by date (most recent first)
        updatedReviews.sort((a, b) => {
          const dateA = new Date(a.date.split('-').reverse().join('-'));
          const dateB = new Date(b.date.split('-').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });

        // Save to localStorage
        localStorage.setItem('reviews', JSON.stringify(updatedReviews));

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

  const handleClearAllReviews = () => {
    localStorage.setItem('reviews', '[]');
    toast.success('Tutte le recensioni sono state eliminate con successo');
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
          Elimina tutte le recensioni
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleClearAllReviews}
        title="Elimina tutte le recensioni"
        description="Sei sicuro di voler eliminare tutte le recensioni? Questa azione non può essere annullata."
      />
    </div>
  );
};

export default ImportTab;