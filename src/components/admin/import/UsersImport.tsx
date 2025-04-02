
import { useState, useEffect, useRef } from "react";
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
import { checkSessionHealth } from "@/utils/auth/sessionUtils";

interface ImportedUser {
  id: string;
  username: string;
  email?: string;
  birth_year?: string;
  gender?: string;
  created_at?: string;
  gdpr_consent?: boolean;
}

export const UsersImport = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastImportTimestamp, setLastImportTimestamp] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { data: session } = useAuthSession();
  const importInProgress = useRef(false);

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

  const prepareForImport = async () => {
    try {
      const sessionValid = await checkSessionHealth();
      if (!sessionValid) {
        toast.error("Sessione scaduta", {
          description: "La tua sessione è scaduta, effettua nuovamente il login."
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error preparing for import:", error);
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (importInProgress.current) {
      toast.warning("Importazione già in corso");
      return;
    }

    importInProgress.current = true;
    resetImportState();
    setIsLoading(true);
    console.log('Starting user import process...');

    try {
      const sessionReady = await prepareForImport();
      if (!sessionReady) {
        importInProgress.current = false;
        setIsLoading(false);
        return;
      }

      const userEmail = session?.user?.email;
      
      if (!userEmail || !adminEmails.includes(userEmail)) {
        setImportError("Non hai i permessi necessari per importare utenti. È richiesto un account amministratore.");
        toast.error("Permessi insufficienti", {
          description: "È necessario essere un amministratore per importare utenti"
        });
        setIsLoading(false);
        importInProgress.current = false;
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
        importInProgress.current = false;
        return;
      }

      console.log(`Processing ${jsonData.length} user rows...`);
      const validUsers = [];
      const errors = [];
      const timestamp = new Date().toISOString();
      
      setTotalRows(jsonData.length);

      // Process in smaller batches to prevent timeouts
      const batchSize = 1; // Process one at a time for better reliability
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        await processBatch(batch, i, validUsers, errors, timestamp);
        
        if (i % 20 === 0 && i > 0) {
          await checkSessionHealth();
        }
      }

      if (errors.length > 0) {
        console.error('Import errors:', errors);
        setImportError(errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... e altri ${errors.length - 5} errori` : ''));
        
        if (errors.length <= 5) {
          errors.forEach(error => toast.error(error));
        } else {
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
      importInProgress.current = false;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processBatch = async (
    batch: any[], 
    startIndex: number, 
    validUsers: ImportedUser[], 
    errors: string[], 
    timestamp: string
  ) => {
    for (const [index, row] of batch.entries()) {
      const currentIndex = startIndex + index;
      try {
        setProcessedRows(currentIndex + 1);
        setImportProgress(Math.round(((currentIndex + 1) / totalRows) * 100));
        
        console.log(`Validating user row ${currentIndex + 1}:`, row);
        setDebugInfo(`Validazione riga ${currentIndex + 1} di ${totalRows}`);
        
        const email = row['email'] || row['Email'];
        const username = row['username'] || row['Username'];
        
        if (!username) {
          errors.push(`Riga ${currentIndex + 2}: Username è un campo obbligatorio`);
          continue;
        }

        if (email) {
          const { data: existingUsers, error: searchError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

          if (searchError) {
            console.error('Error searching for user:', searchError);
            errors.push(`Riga ${currentIndex + 2}: Errore durante la verifica dell'email: ${searchError.message}`);
            continue;
          }

          if (existingUsers && existingUsers.length > 0) {
            errors.push(`Riga ${currentIndex + 2}: L'email ${email} è già in uso`);
            continue;
          }
        }

        const userId = row['id'] || row['ID'] || uuidv4();
        const birthYear = row['birth_year'] || row['Birth Year'] || row['Anno di Nascita'] || null;
        const gender = row['gender'] || row['Gender'] || row['Genere'] || null;
        const gdprConsent = row['gdpr_consent'] || row['GDPR Consent'] || true;
        
        let createdAt;
        try {
          const dateInput = row['created_at'] || row['Created At'] || row['Data Registrazione'];
          if (dateInput) {
            if (typeof dateInput === 'number') {
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

        const user: ImportedUser = {
          id: userId.toString(),
          username: username.toString(),
          created_at: createdAt
        };
        
        if (email) user.email = email.toString();
        if (birthYear) user.birth_year = birthYear.toString();
        if (gender) user.gender = gender.toString();
        if (gdprConsent !== undefined) user.gdpr_consent = Boolean(gdprConsent);

        console.log('Processed user:', user);
        setDebugInfo(`Inserimento utente: ${user.username}`);

        try {
          // For username-only imports, use direct admin function as primary method
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          
          console.log("Calling admin import function");
          setDebugInfo(`Chiamata funzione admin per utente: ${user.username}`);
          
          try {
            // Get the full URL of the function
            const functionUrl = `${supabaseUrl}/functions/v1/admin-import-user`;
            console.log("Function URL:", functionUrl);
            
            const response = await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({ user })
            });
            
            const responseText = await response.text();
            console.log("Response status:", response.status);
            console.log("Response text:", responseText);
            
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.error("Failed to parse response:", parseError);
              errors.push(`Riga ${currentIndex + 2}: Risposta non valida dal server: ${responseText}`);
              continue;
            }
            
            if (!response.ok) {
              console.error('Admin import API error:', response.status, data);
              errors.push(`Riga ${currentIndex + 2}: Errore API (${response.status}): ${data.error || 'Errore sconosciuto'}`);
              continue;
            }
            
            if (!data.success) {
              console.error('Admin import failed:', data);
              errors.push(`Riga ${currentIndex + 2}: ${data.error || 'Errore durante l\'inserimento'}`);
              continue;
            }
            
            console.log('Admin import response:', data);
            validUsers.push(user);
            
          } catch (fetchError) {
            console.error('Error calling admin function:', fetchError);
            
            // Fallback to direct insert if function call failed
            console.log('Fallback to direct insert');
            const { error: insertError } = await supabase
              .from('users')
              .insert(user);

            if (insertError) {
              errors.push(`Riga ${currentIndex + 2}: Errore durante l'inserimento: ${insertError.message}`);
              continue;
            }
            
            validUsers.push(user);
          }
          
          console.log(`Successfully inserted user for row ${currentIndex + 1}`);
        } catch (error) {
          console.error(`Error during user insertion:`, error);
          errors.push(`Riga ${currentIndex + 2}: ${(error as Error).message}`);
        }
      } catch (error) {
        console.error(`Error processing row ${currentIndex + 1}:`, error);
        errors.push(`Riga ${currentIndex + 2}: ${(error as Error).message}`);
      }
    }
  };

  const handleUndoLastImport = async () => {
    if (!lastImportTimestamp) {
      toast.error("Nessuna importazione recente da annullare");
      return;
    }

    try {
      const sessionValid = await checkSessionHealth();
      if (!sessionValid) {
        toast.error("Sessione scaduta", {
          description: "La tua sessione è scaduta, effettua nuovamente il login per annullare l'importazione."
        });
        return;
      }

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
    const wb = XLSX.utils.book_new();
    
    const data = [
      {
        "Username": "NuovoUtente",
        "Email": "esempio@email.com",
        "Anno di Nascita": "1990",
        "Genere": "M",
        "Data Registrazione": new Date().toISOString().split('T')[0],
        "GDPR Consent": true,
        "ID": uuidv4()
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(wb, ws, "Template Utenti");
    
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
            ref={fileInputRef}
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
