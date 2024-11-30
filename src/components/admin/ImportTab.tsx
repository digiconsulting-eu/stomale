import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { Loader2 } from "lucide-react";

interface ImportedReview {
  condition: string;
  title: string;
  symptoms: string;
  experience: string;
  diagnosisDifficulty: number;
  symptomsDiscomfort: number;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
  date: string;
  username: string;
  email: string;
}

const ImportTab = () => {
  const [isLoading, setIsLoading] = useState(false);

  const validateRow = (row: any): ImportedReview | null => {
    const requiredFields = [
      'Patologia', 'Titolo', 'Sintomi', 'Esperienza',
      'Difficoltà di Diagnosi', 'Quanto sono fastidiosi i sintomi?',
      'Efficacia cura farmacologica', 'Possibilità di guarigione',
      'Disagio sociale', 'Data', 'Nome Utente', 'Email'
    ];

    for (const field of requiredFields) {
      if (!row[field]) {
        toast({
          title: "Errore di validazione",
          description: `Campo mancante: ${field}`,
          variant: "destructive",
        });
        return null;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row['Email'])) {
      toast({
        title: "Errore di validazione",
        description: "Formato email non valido",
        variant: "destructive",
      });
      return null;
    }

    // Validate ratings (should be between 1 and 5)
    const ratingFields = [
      'Difficoltà di Diagnosi',
      'Quanto sono fastidiosi i sintomi?',
      'Efficacia cura farmacologica',
      'Possibilità di guarigione',
      'Disagio sociale'
    ];

    for (const field of ratingFields) {
      const rating = Number(row[field]);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        toast({
          title: "Errore di validazione",
          description: `Il campo "${field}" deve essere un numero da 1 a 5`,
          variant: "destructive",
        });
        return null;
      }
    }

    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!dateRegex.test(row['Data'])) {
      toast({
        title: "Errore di validazione",
        description: "Il campo 'Data' deve essere nel formato DD-MM-YYYY",
        variant: "destructive",
      });
      return null;
    }

    return {
      condition: row['Patologia'],
      title: row['Titolo'],
      symptoms: row['Sintomi'],
      experience: row['Esperienza'],
      diagnosisDifficulty: Number(row['Difficoltà di Diagnosi']),
      symptomsDiscomfort: Number(row['Quanto sono fastidiosi i sintomi?']),
      medicationEffectiveness: Number(row['Efficacia cura farmacologica']),
      healingPossibility: Number(row['Possibilità di guarigione']),
      socialDiscomfort: Number(row['Disagio sociale']),
      date: row['Data'],
      username: row['Nome Utente'],
      email: row['Email']
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const validReviews: ImportedReview[] = [];
      let errorCount = 0;

      for (const row of jsonData) {
        const validatedRow = validateRow(row);
        if (validatedRow) {
          validReviews.push(validatedRow);
        } else {
          errorCount++;
        }
      }

      if (validReviews.length > 0) {
        const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        localStorage.setItem('reviews', JSON.stringify([...existingReviews, ...validReviews]));

        toast({
          title: "Importazione completata",
          description: `${validReviews.length} recensioni importate con successo${
            errorCount > 0 ? `. ${errorCount} recensioni ignorate per errori.` : '.'
          }`,
        });
      } else {
        toast({
          title: "Errore di importazione",
          description: "Nessuna recensione valida trovata nel file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'importazione del file.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">Importa Recensioni</h2>
        <p className="text-sm text-muted-foreground">
          Carica un file Excel (.xlsx) contenente le recensioni da importare.
          Il file deve contenere i seguenti campi nell'ordine specificato:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Patologia (testo)</li>
          <li>Titolo (testo)</li>
          <li>Sintomi (testo)</li>
          <li>Esperienza (testo)</li>
          <li>Difficoltà di Diagnosi (voto da 1 a 5)</li>
          <li>Quanto sono fastidiosi i sintomi? (voto da 1 a 5)</li>
          <li>Efficacia cura farmacologica (voto da 1 a 5)</li>
          <li>Possibilità di guarigione (voto da 1 a 5)</li>
          <li>Disagio sociale (voto da 1 a 5)</li>
          <li>Data (formato DD-MM-YYYY)</li>
          <li>Nome Utente (testo)</li>
          <li>Email (formato valido)</li>
        </ul>
      </div>

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