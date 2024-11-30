import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2 } from "lucide-react";
import { ImportInstructions } from "./import/ImportInstructions";
import { validateRow } from "./import/ImportValidator";

const ImportTab = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const validReviews = [];
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const validatedRow = validateRow(row);
          if (validatedRow) {
            validReviews.push(validatedRow);
          }
        } catch (error) {
          errorCount++;
          toast.error((error as Error).message);
        }
      }

      if (validReviews.length > 0) {
        const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const updatedReviews = [...existingReviews, ...validReviews];
        localStorage.setItem('reviews', JSON.stringify(updatedReviews));

        toast.success(
          `${validReviews.length} recensioni importate con successo${
            errorCount > 0 ? `. ${errorCount} recensioni ignorate per errori.` : '.'
          }`
        );
      } else {
        toast.error("Nessuna recensione valida trovata nel file.");
      }
    } catch (error) {
      toast.error("Si è verificato un errore durante l'importazione del file.");
      console.error(error);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
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
      </div>
    </div>
  );
};

export default ImportTab;