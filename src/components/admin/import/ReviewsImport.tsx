
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2, Trash2, Users } from "lucide-react";
import { ImportInstructions } from "./ImportInstructions";
import { ImportTemplate } from "./ImportTemplate";
import { validateRow } from "./ImportValidator";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

export const ReviewsImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastImportTimestamp, setLastImportTimestamp] = useState<string | null>(null);
  const { data: session } = useAuthSession();

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
      const timestamp = new Date().toISOString();

      for (const [index, row] of jsonData.entries()) {
        try {
          console.log(`Validating row ${index + 1}:`, row);
          const validatedRow = await validateRow(row);
          
          if (validatedRow) {
            console.log(`Inserting review for condition ID ${validatedRow.condition_id} and user ${validatedRow.username}`);
            
            const { error: insertError } = await supabase
              .from('reviews')
              .insert({
                ...validatedRow,
                import_timestamp: timestamp
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
        setLastImportTimestamp(timestamp);
        toast.success(
          `${validReviews.length} recensioni importate con successo con nuovi utenti creati automaticamente (Anonimo1, Anonimo2, ecc.)${
            errors.length > 0 ? `. ${errors.length} recensioni ignorate per errori.` : '.'
          }`
        );
      } else {
        toast.error("Nessuna recensione valida trovata nel file.");
      }
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast.error("Si è verificato un errore durante l'importazione del file");
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleUndoLastImport = async () => {
    if (!lastImportTimestamp) {
      toast.error("Nessuna importazione recente da annullare");
      return;
    }

    try {
      // Prima elimina le recensioni importate
      const { error: reviewsError } = await supabase
        .from('reviews')
        .delete()
        .eq('import_timestamp', lastImportTimestamp);

      if (reviewsError) {
        console.error('Error deleting reviews:', reviewsError);
        toast.error("Errore durante l'eliminazione delle recensioni");
        return;
      }

      // Poi elimina gli utenti creati durante l'importazione (che iniziano con "Anonimo")
      // ma solo quelli senza altre recensioni
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .like('username', 'Anonimo%')
        .not('username', 'in', `(
          SELECT DISTINCT username 
          FROM reviews 
          WHERE username IS NOT NULL AND import_timestamp != '${lastImportTimestamp}'
        )`);

      if (usersError) {
        console.error('Error deleting users:', usersError);
        // Non blocchiamo l'operazione se c'è un errore nell'eliminazione degli utenti
        console.log('Users deletion failed, but reviews were deleted successfully');
      }

      toast.success("Ultima importazione annullata con successo");
      setLastImportTimestamp(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Si è verificato un errore durante l'annullamento dell'importazione");
    }
  };

  return (
    <div className="space-y-6">
      <ImportInstructions />
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">Importazione Automatica</h3>
        <p className="text-blue-700 text-sm">
          Durante l'importazione verranno creati automaticamente:
        </p>
        <ul className="text-blue-700 text-sm mt-2 list-disc list-inside">
          <li>Nuovi utenti con username progressivi (Anonimo1, Anonimo2, Anonimo3, ecc.)</li>
          <li>Date casuali per ogni recensione tra 1/1/2020 e 10/6/2025</li>
          <li>Valori casuali per campi opzionali se non specificati</li>
        </ul>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <ImportTemplate />
        
        <Button
          variant="outline"
          onClick={() => window.open(`https://supabase.com/dashboard/project/hnuhdoycwpjfjhthfqbt/auth/users`, '_blank')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Visualizza Utenti su Supabase
        </Button>
        
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

        {lastImportTimestamp && (
          <Button
            variant="destructive"
            onClick={handleUndoLastImport}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Annulla ultima importazione
          </Button>
        )}
      </div>
    </div>
  );
};
