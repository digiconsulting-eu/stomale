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
import { Loader2, AlertTriangle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ReviewEditDialogProps {
  reviewId: number;
  currentTitle: string;
  currentSymptoms: string;
  currentExperience: string;
  isOpen: boolean;
  onClose: () => void;
}

interface RiskAnalysis {
  score: number;
  category: string;
  reasons: string[];
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
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const calculateRiskScore = (expText: string): { score: number; reasons: string[] } => {
    const reasons: string[] = [];
    let score = 0;
    const expLength = expText.length;

    // Lunghezza
    if (expLength < 100) {
      score += 30;
      reasons.push('Molto breve (<100 char)');
    } else if (expLength < 200) {
      score += 20;
      reasons.push('Breve (100-200 char)');
    }

    // Pattern AI comuni
    const aiPatterns = [
      { pattern: /è una malattia/gi, weight: 15, label: 'Inizio enciclopedico' },
      { pattern: /dopo il trattamento/gi, weight: 12, label: 'Frase standard' },
      { pattern: /fondamentale/gi, weight: 10, label: 'Linguaggio formale' },
      { pattern: /approccio/gi, weight: 8, label: 'Termine tecnico ripetitivo' },
      { pattern: /è efficace/gi, weight: 10, label: 'Pattern generico' },
      { pattern: /grazie a/gi, weight: 5, label: 'Costruzione standard' },
      { pattern: /richiede un/gi, weight: 8, label: 'Struttura formale' }
    ];

    aiPatterns.forEach(({ pattern, weight, label }) => {
      if (pattern.test(expText)) {
        score += weight;
        reasons.push(label);
      }
    });

    // Mancanza di emotività
    const hasEmotion = /[.]{2,}|[!?]{2,}|:\(|:\)|😭|😊/gi.test(expText);
    if (!hasEmotion) {
      score += 15;
      reasons.push('Zero emotività');
    }

    // Mancanza di dettagli specifici
    const hasSpecifics = /\d{4}|\d+\s*cm|\d+\s*mm|eparina|cardioaspirina|nn |xché | x /gi.test(expText);
    if (!hasSpecifics) {
      score += 15;
      reasons.push('Nessun dettaglio specifico');
    }

    // Tono troppo formale
    const formalTone = expText.split('.').length > 3 && expLength < 250;
    if (formalTone) {
      score += 10;
      reasons.push('Tono eccessivamente formale');
    }

    return { score, reasons };
  };

  const getRiskCategory = (score: number): string => {
    if (score >= 70) return 'CRITICO';
    if (score >= 50) return 'ALTO';
    if (score >= 30) return 'MEDIO';
    if (score >= 15) return 'BASSO';
    return 'AUTENTICA';
  };

  const handleAnalyzeRisk = () => {
    setIsAnalyzing(true);
    try {
      const { score, reasons } = calculateRiskScore(experience);
      const category = getRiskCategory(score);
      setRiskAnalysis({ score, category, reasons });
      toast.success("Analisi rischio completata");
    } catch (error) {
      console.error('Error analyzing risk:', error);
      toast.error("Errore durante l'analisi del rischio");
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      
      // Calcola automaticamente il rischio dopo il salvataggio
      handleAnalyzeRisk();
      
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast.error("Errore durante il salvataggio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-white p-0">
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle>Modifica Recensione #{reviewId}</DialogTitle>
            <DialogDescription>
              Modifica i contenuti della recensione. Tutti i campi sono obbligatori.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Security Warnings */}
          <Alert variant="destructive" className="border-orange-300 bg-orange-50 mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Avvisi di Sicurezza (2 errori outdated)</AlertTitle>
            <AlertDescription className="text-sm space-y-1">
              <p>• Verifica manualmente che il contenuto non violi le policy</p>
              <p>• Controlla presenza di informazioni mediche sensibili</p>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo della recensione"
                className="bg-white"
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
                className="bg-white"
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
                className="bg-white"
              />
            </div>

            {/* Risk Analysis Result */}
            {riskAnalysis && (
              <Alert className={`
                ${riskAnalysis.category === 'CRITICO' ? 'border-red-500 bg-red-50' :
                  riskAnalysis.category === 'ALTO' ? 'border-orange-500 bg-orange-50' :
                  riskAnalysis.category === 'MEDIO' ? 'border-yellow-500 bg-yellow-50' :
                  riskAnalysis.category === 'BASSO' ? 'border-blue-500 bg-blue-50' :
                  'border-green-500 bg-green-50'}
              `}>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  Analisi Rischio AI
                  <Badge variant={riskAnalysis.category === 'CRITICO' || riskAnalysis.category === 'ALTO' ? 'destructive' : 'secondary'}>
                    {riskAnalysis.category}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <p className="font-semibold mb-2">Punteggio: {riskAnalysis.score}/100</p>
                  {riskAnalysis.reasons.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">Motivi:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {riskAnalysis.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleAnalyzeRisk} 
              disabled={isAnalyzing || isSaving}
              className="mr-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisi...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Calcola Rischio
                </>
              )}
            </Button>
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
