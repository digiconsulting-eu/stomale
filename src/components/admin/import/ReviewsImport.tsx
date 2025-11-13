
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2, Trash2, Users } from "lucide-react";
import { ImportInstructions } from "./ImportInstructions";
import { ImportTemplate } from "./ImportTemplate";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

export const ReviewsImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastImportTimestamp, setLastImportTimestamp] = useState<string | null>(null);
  const { data: session } = useAuthSession();

  console.log('ReviewsImport component mounted');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== FILE UPLOAD TRIGGERED ===');
    console.log('Event:', event);
    console.log('Event target:', event.target);
    console.log('Files:', event.target.files);
    
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected - returning early');
      return;
    }

    console.log('=== STARTING IMPORT PROCESS ===');
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    setIsLoading(true);

    try {
      console.log('Reading file as array buffer...');
      const data = await file.arrayBuffer();
      console.log('Array buffer created, size:', data.byteLength);

      console.log('Creating workbook...');
      const workbook = XLSX.read(data);
      console.log('Workbook created, sheets:', workbook.SheetNames);

      if (!workbook.SheetNames[0]) {
        console.error('No sheets found in workbook');
        toast.error("Il file Excel non contiene fogli");
        return;
      }

      console.log('Reading worksheet:', workbook.SheetNames[0]);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log('JSON data extracted:', jsonData.length, 'rows');
      console.log('First row sample:', jsonData[0]);

      if (jsonData.length === 0) {
        console.log('File is empty');
        toast.error("Il file è vuoto");
        return;
      }

      console.log(`Processing ${jsonData.length} rows via edge function...`);
      
      // Chiama l'edge function per l'importazione
      const { data: result, error: functionError } = await supabase.functions.invoke('import-reviews', {
        body: { reviews: jsonData }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        toast.error(`Errore durante l'importazione: ${functionError.message}`);
        return;
      }

      const { imported, errors: errorCount, errorDetails } = result;

      console.log('=== IMPORT SUMMARY ===');
      console.log('Imported reviews:', imported);
      console.log('Errors:', errorCount);

      if (errorCount > 0) {
        console.error('Import errors:', errorDetails);
        toast.error(`${errorCount} recensioni hanno avuto errori durante l'importazione`);
      }

      if (imported > 0) {
        setLastImportTimestamp(new Date().toISOString());
        toast.success(
          `${imported} recensioni importate con successo con nuovi utenti creati automaticamente (Anonimo1, Anonimo2, ecc.)${
            errorCount > 0 ? `. ${errorCount} recensioni ignorate per errori.` : '.'
          }`
        );
      } else {
        toast.error("Nessuna recensione valida trovata nel file.");
      }
    } catch (error) {
      console.error('=== CRITICAL ERROR IN IMPORT ===');
      console.error('Error details:', error);
      console.error('Error stack:', (error as Error).stack);
      toast.error("Si è verificato un errore durante l'importazione del file: " + (error as Error).message);
    } finally {
      console.log('=== IMPORT PROCESS ENDED ===');
      setIsLoading(false);
      if (event.target) {
        event.target.value = '';
      }
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

  // Debug: aggiungi log per verificare lo stato del componente
  console.log('Component render - isLoading:', isLoading, 'lastImportTimestamp:', lastImportTimestamp);

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
        
        <div className="relative">
          <Button
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
            onClick={() => {
              console.log('=== BUTTON CLICKED - Debug Info ===');
              console.log('Button disabled:', isLoading);
              console.log('Will trigger file input click');
            }}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Seleziona File Excel
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              console.log('=== INPUT CHANGE EVENT TRIGGERED ===');
              console.log('Input change event:', e);
              console.log('Files from event:', e.target.files);
              handleFileUpload(e);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={isLoading}
            onClick={(e) => {
              console.log('=== INPUT CLICK EVENT ===');
              console.log('File input clicked');
              // Reset the value to allow selecting the same file again
              e.currentTarget.value = '';
            }}
          />
        </div>

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

export default ReviewsImport;
