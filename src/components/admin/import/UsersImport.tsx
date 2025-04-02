
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getAdminEmails } from "@/utils/auth";
import { Progress } from "@/components/ui/progress";

// Update the interface to make email optional for manual imports
interface ImportedUser {
  id: string; // ID is required
  username: string; // Username is still required
  email?: string; // Email is optional
  birth_year?: string;
  gender?: string;
  created_at?: string;
  gdpr_consent?: boolean;
}

export const UsersImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastImportTimestamp, setLastImportTimestamp] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { data: session } = useAuthSession();
  
  // Fetch admin emails on component mount
  useEffect(() => {
    const loadAdminEmails = async () => {
      const emails = await getAdminEmails();
      setAdminEmails(emails);
    };
    
    loadAdminEmails();
  }, []);

  const resetImportState = () => {
    setImportError(null);
    setImportProgress(0);
    setTotalRows(0);
    setProcessedRows(0);
    setDebugInfo(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resetImportState();
    setIsLoading(true);
    console.log('Starting user import process...');

    try {
      // Check if current user is admin
      const userEmail = session?.user?.email;
      
      if (!userEmail || !adminEmails.includes(userEmail)) {
        setImportError("Non hai i permessi necessari per importare utenti. È richiesto un account amministratore.");
        toast.error("Permessi insufficienti", {
          description: "È necessario essere un amministratore per importare utenti"
        });
        setIsLoading(false);
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Raw JSON data:', JSON.stringify(jsonData).substring(0, 200) + '...');

      if (jsonData.length === 0) {
        toast.error("Il file è vuoto");
        setIsLoading(false);
        return;
      }

      console.log(`Processing ${jsonData.length} user rows...`);
      const validUsers = [];
      const errors = [];
      const timestamp = new Date().toISOString();
      
      setTotalRows(jsonData.length);

      for (const [index, row] of jsonData.entries()) {
        try {
          setProcessedRows(index + 1);
          setImportProgress(Math.round(((index + 1) / jsonData.length) * 100));
          
          console.log(`Validating user row ${index + 1}:`, row);
          setDebugInfo(`Validazione riga ${index + 1} di ${jsonData.length}`);
          
          // Extract user data
          const email = row['email'] || row['Email'];
          const username = row['username'] || row['Username'];
          
          if (!username) {
            errors.push(`Riga ${index + 2}: Username è un campo obbligatorio`);
            continue;
          }

          // Check if email is already in use, only if an email is provided
          if (email) {
            const { data: existingUsers, error: searchError } = await supabase
              .from('users')
              .select('email')
              .eq('email', email);

            if (searchError) {
              console.error('Error searching for user:', searchError);
              errors.push(`Riga ${index + 2}: Errore durante la verifica dell'email: ${searchError.message}`);
              continue;
            }

            if (existingUsers && existingUsers.length > 0) {
              errors.push(`Riga ${index + 2}: L'email ${email} è già in uso`);
              continue;
            }
          }

          // Create user object with automatically generated ID if not present
          const userId = row['id'] || row['ID'] || uuidv4();
          const birthYear = row['birth_year'] || row['Birth Year'] || row['Anno di Nascita'] || null;
          const gender = row['gender'] || row['Gender'] || row['Genere'] || null;
          const gdprConsent = row['gdpr_consent'] || row['GDPR Consent'] || true;
          
          // Format date
          let createdAt;
          try {
            const dateInput = row['created_at'] || row['Created At'] || row['Data Registrazione'];
            if (dateInput) {
              if (typeof dateInput === 'number') {
                // Handle Excel date format (days since 1900-01-01)
                const excelEpoch = new Date(1899, 11, 30);
                createdAt = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000).toISOString();
              } else {
                createdAt = new Date(dateInput).toISOString();
              }
            } else {
              createdAt = new Date().toISOString();
            }
          } catch (error) {
            console.error('Error formatting date:', error);
            createdAt = new Date().toISOString();
          }

          // Create user object with required fields and optional email
          const user: ImportedUser = {
            id: userId.toString(), // Ensure id is a string and is always present
            username: username.toString(),
            created_at: createdAt
          };
          
          // Add optional fields only if they have values
          if (email) user.email = email.toString();
          if (birthYear) user.birth_year = birthYear.toString();
          if (gender) user.gender = gender.toString();
          if (gdprConsent !== undefined) user.gdpr_consent = Boolean(gdprConsent);

          console.log('Processed user:', user);
          setDebugInfo(`Inserimento utente: ${user.username}`);

          try {
            // First try inserting directly (for non-RLS protected tables)
            const { error: insertError } = await supabase
              .from('users')
              .insert(user);

            if (insertError) {
              console.error('Error inserting user directly:', insertError);
              
              // If it's an RLS error, try with the admin function
              if (insertError.message.includes('row-level security policy')) {
                console.log('Using admin function to bypass RLS...');
                setDebugInfo(`Utilizzo funzione admin per utente: ${user.username}`);
                
                // Call the admin import function
                const { data, error: adminInsertError } = await supabase.functions.invoke('admin-import-user', {
                  body: { user }
                });
                
                if (adminInsertError) {
                  console.error('Admin import error:', adminInsertError);
                  errors.push(`Riga ${index + 2}: Errore durante l'inserimento con privilegi elevati: ${adminInsertError.message || 'Errore sconosciuto'}`);
                  continue;
                }
                
                console.log('Admin import response:', data);
              } else {
                errors.push(`Riga ${index + 2}: Errore durante l'inserimento nel database: ${insertError.message}`);
                continue;
              }
            }
            
            validUsers.push(user);
            console.log(`Successfully inserted user for row ${index + 1}`);
          } catch (error) {
            console.error(`Error during user insertion:`, error);
            errors.push(`Riga ${index + 2}: ${(error as Error).message}`);
          }
        } catch (error) {
          console.error(`Error processing row ${index + 1}:`, error);
          errors.push(`Riga ${index + 2}: ${(error as Error).message}`);
        }
      }

      if (errors.length > 0) {
        console.error('Import errors:', errors);
        setImportError(errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... e altri ${errors.length - 5} errori` : ''));
        
        if (errors.length <= 5) {
          // Show individual errors if there are just a few
          errors.forEach(error => toast.error(error));
        } else {
          // Show a summary if there are many errors
          toast.error(`${errors.length} errori durante l'importazione`, {
            description: "Controlla il pannello degli errori per i dettagli"
          });
        }
      }

      if (validUsers.length > 0) {
        setLastImportTimestamp(timestamp);
        toast.success(
          `${validUsers.length} utenti importati con successo${
            errors.length > 0 ? `. ${errors.length} utenti ignorati per errori.` : '.'
          }`
        );
      } else {
        toast.error("Nessun utente valido importato", {
          description: "Controlla gli errori e i privilegi di accesso."
        });
      }
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      setImportError(`Si è verificato un errore durante l'importazione del file: ${(error as Error).message}`);
      toast.error("Errore durante l'importazione", {
        description: (error as Error).message || "Verifica i privilegi di accesso"
      });
    } finally {
      setIsLoading(false);
      setDebugInfo(null);
      event.target.value = '';
    }
  };

  const handleUndoLastImport = async () => {
    if (!lastImportTimestamp) {
      toast.error("Nessuna importazione recente da annullare");
      return;
    }

    try {
      // To undo the last import, we need to find users with the
      // specified timestamp and remove them manually, since we don't have an
      // import_timestamp field in the users table
      const { error } = await supabase
        .from('users')
        .delete()
        .gt('created_at', lastImportTimestamp)
        .lt('created_at', new Date(new Date(lastImportTimestamp).getTime() + 60000).toISOString());

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

  const downloadTemplate = () => {
    // Create a new Excel sheet
    const wb = XLSX.utils.book_new();
    
    // Define example data
    const data = [
      {
        "Username": "NuovoUtente", // Required field
        "Email": "esempio@email.com", // Optional field
        "Anno di Nascita": "1990",
        "Genere": "M",
        "Data Registrazione": new Date().toISOString().split('T')[0],
        "GDPR Consent": true,
        // ID is optional, will be generated automatically if not present
      }
    ];
    
    // Convert to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template Utenti");
    
    // Download file
    XLSX.writeFile(wb, "template_utenti.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h2 className="text-xl font-semibold">Istruzioni per l'importazione utenti</h2>
        <p className="text-gray-600">
          Il file Excel deve contenere le seguenti colonne:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li><strong>Username</strong> (obbligatorio) - Nome utente</li>
          <li><strong>Email</strong> (opzionale) - Email dell'utente</li>
          <li><strong>Anno di Nascita</strong> - Anno di nascita</li>
          <li><strong>Genere</strong> - Genere (es. M, F)</li>
          <li><strong>Data Registrazione</strong> - Data di registrazione (opzionale)</li>
          <li><strong>GDPR Consent</strong> - Consenso GDPR (true/false)</li>
          <li><strong>ID</strong> - ID utente (opzionale, verrà generato automaticamente se non presente)</li>
        </ul>
        <p className="text-gray-600 mt-4">
          <strong>Note importanti:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Se non specifichi un ID, verrà generato automaticamente un UUID</li>
          <li>Solo Username è obbligatorio</li>
          <li>L'email è opzionale ma deve essere unica nel sistema se fornita</li>
          <li>È necessario avere privilegi di amministratore per importare utenti</li>
        </ul>
      </div>
      
      {importError && (
        <Alert variant="destructive">
          <AlertTitle>Errore di importazione</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{importError}</AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <Alert>
          <AlertTitle>Stato importazione</AlertTitle>
          <AlertDescription>{debugInfo}</AlertDescription>
        </Alert>
      )}
      
      {isLoading && totalRows > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Importazione in corso...</span>
            <span>{processedRows} di {totalRows} righe ({importProgress}%)</span>
          </div>
          <Progress value={importProgress} className="h-2" />
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-4">
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Download className="h-4 w-4" />
          Scarica Template Excel
        </Button>
        
        <Button
          variant="outline"
          className="relative"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? "Importazione in corso..." : "Seleziona File Excel"}
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isLoading}
          />
        </Button>

        {lastImportTimestamp && (
          <Button
            variant="destructive"
            onClick={handleUndoLastImport}
            className="gap-2"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Annulla ultima importazione
          </Button>
        )}
      </div>
    </div>
  );
};
