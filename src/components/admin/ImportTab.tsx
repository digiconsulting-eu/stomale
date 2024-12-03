import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Loader2, Trash2 } from "lucide-react";
import { ImportInstructions } from "./import/ImportInstructions";
import { validateRow } from "./import/ImportValidator";
import { ConfirmDialog } from "../ConfirmDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const ImportTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDescriptions, setIsLoadingDescriptions] = useState(false);
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
            validReviews.push({
              ...validatedRow,
              imported: true
            });
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
        const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');

        const updatedReviews = [...existingReviews, ...validReviews];

        updatedReviews.sort((a, b) => {
          const dateA = new Date(a.date.split('-').reverse().join('-'));
          const dateB = new Date(b.date.split('-').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });

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

  const handleDescriptionsFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingDescriptions(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("Il file è vuoto");
        return;
      }

      const errors: string[] = [];
      const updates = [];

      for (const [index, row] of jsonData.entries()) {
        const condition = row['Patologia'];
        const description = row['Descrizione'];

        if (!condition || !description) {
          errors.push(`Riga ${index + 2}: Manca la patologia o la descrizione`);
          continue;
        }

        updates.push({
          Patologia: condition.toUpperCase(),
          Descrizione: description
        });
      }

      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }

      if (updates.length > 0) {
        for (const update of updates) {
          const { error } = await supabase
            .from('PATOLOGIE')
            .upsert(update, {
              onConflict: 'patologia_unique'
            });

          if (error) {
            console.error('Errore Supabase:', error);
            toast.error(`Errore durante il salvataggio di ${update.Patologia}`);
            return;
          }
        }

        toast.success(`${updates.length} descrizioni importate con successo`);
      }

    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast.error("Si è verificato un errore durante l'importazione del file");
    } finally {
      setIsLoadingDescriptions(false);
      event.target.value = '';
    }
  };

  const handleClearImportedReviews = () => {
    const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const manualReviews = allReviews.filter((review: any) => !review.imported);
    localStorage.setItem('reviews', JSON.stringify(manualReviews));
    const deletedCount = allReviews.length - manualReviews.length;
    toast.success(`${deletedCount} recensioni importate sono state eliminate con successo`);
    setShowDeleteDialog(false);
  };

  return (
    <Tabs defaultValue="reviews" className="space-y-6">
      <TabsList>
        <TabsTrigger value="reviews">Recensioni</TabsTrigger>
        <TabsTrigger value="descriptions">Descrizioni Patologie</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="space-y-6">
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
      </TabsContent>

      <TabsContent value="descriptions" className="space-y-6">
        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Istruzioni per l'importazione delle descrizioni</h3>
            <p className="text-sm text-muted-foreground">
              Il file Excel deve contenere due colonne:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Colonna "Patologia": nome della patologia</li>
              <li>Colonna "Descrizione": descrizione della patologia</li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="relative"
            disabled={isLoadingDescriptions}
          >
            {isLoadingDescriptions && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Seleziona File Excel
            <input
              type="file"
              accept=".xlsx"
              onChange={handleDescriptionsFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
        </div>
      </TabsContent>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleClearImportedReviews}
        title="Elimina recensioni importate"
        description="Sei sicuro di voler eliminare tutte le recensioni importate da Excel? Questa azione non può essere annullata. Le recensioni inserite manualmente dagli utenti non verranno eliminate."
      />
    </Tabs>
  );
};

export default ImportTab;
