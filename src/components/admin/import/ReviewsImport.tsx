
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
  const [users, setUsers] = useState<Array<{id: string, username: string}>>([]);
  const { data: session } = useAuthSession();

  // Carica la lista degli utenti per riferimento
  useEffect(() => {
    const loadUsers = async () => {
      if (!session) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username');
      
      if (error) {
        console.error('Errore nel caricamento degli utenti:', error);
        return;
      }
      
      if (data) {
        setUsers(data);
      }
    };
    
    loadUsers();
  }, [session]);

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
            console.log(`Inserting review for condition ID ${validatedRow.condition_id} and user ID ${validatedRow.user_id}`);
            
            // Verifica che l'utente esista prima di inserire la recensione
            if (validatedRow.user_id) {
              const userExists = users.some(user => user.id === validatedRow.user_id);
              if (!userExists) {
                errors.push(`Riga ${index + 2}: User ID "${validatedRow.user_id}" non trovato nel database`);
                continue;
              }
            }
            
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
          `${validReviews.length} recensioni importate con successo${
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
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('import_timestamp', lastImportTimestamp);

      if (error) {
        console.error('Error undoing import:', error);
        toast.error("Errore durante l'annullamento dell'importazione");
        return;
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
      
      <div className="flex flex-wrap items-center gap-4">
        <ImportTemplate />
        
        <Button
          variant="outline"
          onClick={() => window.open(`https://supabase.com/dashboard/project/hnuhdoycwpjfjhthfqbt/auth/users`, '_blank')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Visualizza gli ID Utenti
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
