
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getAdminEmails } from "@/utils/auth";
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

interface UseUsersImportReturn {
  isLoading: boolean;
  importError: string | null;
  debugInfo: string | null;
  importProgress: number;
  totalRows: number;
  processedRows: number;
  lastImportTimestamp: string | null;
  adminEmails: string[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleUndoLastImport: () => Promise<void>;
}

export const useUsersImport = (): UseUsersImportReturn => {
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const loadAdminEmails = async () => {
      const emails = await getAdminEmails();
      setAdminEmails(emails);
    };
    
    loadAdminEmails();
    
    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetImportState = () => {
    setImportError(null);
    setImportProgress(0);
    setTotalRows(0);
    setProcessedRows(0);
    setDebugInfo(null);
    retryCountRef.current = {};
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

  const isJsonResponse = (contentType: string | null): boolean => {
    return !!contentType && contentType.includes('application/json');
  };

  const callEdgeFunction = async (user: ImportedUser, retryCount = 0): Promise<any> => {
    try {
      console.log(`Calling edge function for user ${user.username} (retry: ${retryCount})`);
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      // Use the full Supabase URL from the environment variable
      const response = await fetch(`https://hnuhdoycwpjfjhthfqbt.supabase.co/functions/v1/admin-import-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user }),
        signal,
      });

      // Check for HTML response (error indicator)
      const contentType = response.headers.get('content-type');
      
      if (!isJsonResponse(contentType)) {
        // We got HTML or other non-JSON response
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse.substring(0, 100));
        
        // Retry up to 3 times for non-JSON responses
        if (retryCount < 3) {
          console.log(`Retrying user ${user.username} (attempt ${retryCount + 1})`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return callEdgeFunction(user, retryCount + 1);
        }
        
        throw new Error(`Server returned non-JSON response. Received: ${contentType || 'unknown content type'}`);
      }

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Edge function error:', result);
        
        // If we get a foreign key error, retry up to 2 times
        if (result.error && result.error.includes('foreign key constraint') && retryCount < 2) {
          console.log(`Foreign key error for user ${user.username}, retrying (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return callEdgeFunction(user, retryCount + 1);
        }
        
        throw new Error(result.error || 'Failed to import user through edge function');
      }

      console.log('Edge function success:', result);
      return result;
    } catch (error) {
      // Don't report errors if the request was aborted
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Request was aborted");
        return null;
      }
      
      console.error('Error calling edge function:', error);
      throw error;
    }
  };

  // Process users in smaller batches to avoid overwhelming the server
  const processBatch = async (users: ImportedUser[], startIndex: number, batchSize: number) => {
    const endIndex = Math.min(startIndex + batchSize, users.length);
    const errors = [];
    const validUsers = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      try {
        setProcessedRows(i + 1);
        setImportProgress(Math.round(((i + 1) / users.length) * 100));
        setDebugInfo(`Elaborazione utente ${i + 1} di ${users.length}`);
        
        const user = users[i];
        console.log(`Processing user ${i + 1}:`, user);
        
        // Get retry count for this user
        const userId = user.id || 'unknown';
        const retryCount = retryCountRef.current[userId] || 0;
        
        try {
          // Don't retry more than 3 times per user
          if (retryCount >= 3) {
            errors.push(`Riga ${i + 2}: Troppi tentativi falliti per l'utente ${user.username}`);
            continue;
          }
          
          // Increment retry counter
          retryCountRef.current[userId] = retryCount + 1;
          
          const result = await callEdgeFunction(user);
          if (result) {
            validUsers.push(user);
            console.log(`Successfully inserted user ${i + 1}`);
            
            // Clear retry count on success
            delete retryCountRef.current[userId];
          }
        } catch (callError) {
          console.error(`Error calling edge function for row ${i + 1}:`, callError);
          
          // Add more specific error information
          const errorMessage = (callError as Error).message || 'Errore sconosciuto';
          const isConstraintError = errorMessage.includes('constraint');
          const isProfileError = errorMessage.includes('profiles_id_fkey');
          
          let humanReadableError = `Riga ${i + 2}: `;
          
          if (isProfileError) {
            humanReadableError += `L'ID utente non esiste nel sistema di autenticazione. Potrebbe essere necessario importare prima l'utente nell'auth system.`;
          } else if (isConstraintError) {
            humanReadableError += `Violazione di un vincolo del database. L'utente potrebbe già esistere.`;
          } else {
            humanReadableError += errorMessage;
          }
          
          errors.push(humanReadableError);
        }
        
        // Small delay between processing users
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Riga ${i + 2}: ${(error as Error).message}`);
      }
    }
    
    return { errors, validUsers, nextIndex: endIndex };
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
      const allErrors = [];
      const allValidUsers = [];
      const timestamp = new Date().toISOString();
      
      setTotalRows(jsonData.length);

      // Prepare all users data first
      const users: ImportedUser[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        try {
          const row = jsonData[i];
          console.log(`Preparing row ${i + 1}:`, row);
          
          const username = row['username'] || row['Username'];
          
          if (!username) {
            allErrors.push(`Riga ${i + 2}: Username è un campo obbligatorio`);
            continue;
          }

          const userId = row['id'] || row['ID'] || uuidv4();
          const email = row['email'] || row['Email'];
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
              createdAt = timestamp;
            }
          } catch (error) {
            console.error('Error formatting date:', error);
            createdAt = timestamp;
          }

          if (email) {
            const { data: existingUsers } = await supabase
              .from('users')
              .select('email')
              .eq('email', email);

            if (existingUsers && existingUsers.length > 0) {
              allErrors.push(`Riga ${i + 2}: L'email ${email} è già in uso`);
              continue;
            }
          }
          
          const userData: ImportedUser = {
            id: userId.toString(),
            username: username.toString(),
            created_at: createdAt,
            gdpr_consent: Boolean(gdprConsent)
          };
          
          if (email) userData.email = email.toString();
          if (birthYear) userData.birth_year = birthYear.toString();
          if (gender) userData.gender = gender.toString();
          
          users.push(userData);
        } catch (error) {
          console.error(`Error preparing row ${i + 1}:`, error);
          allErrors.push(`Riga ${i + 2}: ${(error as Error).message}`);
        }
      }
      
      // Process users in batches of a smaller size to avoid overwhelming the server
      const BATCH_SIZE = 10; // Reduced batch size
      let nextIndex = 0;
      
      while (nextIndex < users.length && !abortControllerRef.current?.signal.aborted) {
        // Check session health before each batch
        const sessionHealth = await checkSessionHealth();
        if (!sessionHealth) {
          toast.error("Sessione scaduta durante l'importazione", {
            description: "Effettua nuovamente il login e riprova."
          });
          break;
        }
        
        const { errors, validUsers, nextIndex: newNextIndex } = 
          await processBatch(users, nextIndex, BATCH_SIZE);
        
        allErrors.push(...errors);
        allValidUsers.push(...validUsers);
        nextIndex = newNextIndex;
        
        // Add a small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (allErrors.length > 0) {
        console.error('Import errors:', allErrors);
        setImportError(allErrors.slice(0, 5).join('\n') + (allErrors.length > 5 ? `\n... e altri ${allErrors.length - 5} errori` : ''));
        
        if (allErrors.length <= 5) {
          allErrors.forEach(error => toast.error(error));
        } else {
          toast.error(`${allErrors.length} errori durante l'importazione`, {
            description: "Controlla il pannello degli errori per i dettagli"
          });
        }
      }

      if (allValidUsers.length > 0) {
        setLastImportTimestamp(timestamp);
        toast.success(
          `${allValidUsers.length} utenti importati con successo${
            allErrors.length > 0 ? `. ${allErrors.length} utenti ignorati per errori.` : '.'
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
      if (event.target.value) event.target.value = '';
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

  return {
    isLoading,
    importError,
    debugInfo,
    importProgress,
    totalRows,
    processedRows,
    lastImportTimestamp,
    adminEmails,
    handleFileUpload,
    handleUndoLastImport
  };
};
