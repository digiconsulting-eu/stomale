import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewEditDialogProps {
  reviewId: number;
  currentTitle: string;
  currentSymptoms: string;
  currentExperience: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewEditDialog = ({
  reviewId,
  currentTitle,
  currentSymptoms,
  currentExperience,
  isOpen,
  onClose,
}: ReviewEditDialogProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(currentTitle);
  const [symptoms, setSymptoms] = useState(currentSymptoms);
  const [experience, setExperience] = useState(currentExperience);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !symptoms.trim() || !experience.trim()) {
      toast.error("Tutti i campi sono obbligatori");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          title: title.trim(),
          symptoms: symptoms.trim(),
          experience: experience.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error updating review:', error);
        toast.error("Errore durante l'aggiornamento della recensione");
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['review', reviewId] })
      ]);

      toast.success("Recensione aggiornata con successo");
      onClose();
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast.error("Errore durante il salvataggio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Recensione #{reviewId}</DialogTitle>
          <DialogDescription>
            Modifica i contenuti della recensione. Tutti i campi sono obbligatori.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo della recensione"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Sintomi</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Descrivi i sintomi..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Esperienza</Label>
            <Textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Racconta la tua esperienza..."
              rows={10}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              'Salva Modifiche'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
