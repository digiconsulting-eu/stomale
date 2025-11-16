import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

interface Review {
  id: number;
  title: string;
  experience: string;
  symptoms: string;
  username: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  patologia: string;
}

interface ReviewRisk {
  id: number;
  titolo: string;
  patologia: string;
  username: string;
  data_creazione: string;
  lunghezza_esperienza: number;
  rischio: string;
  punteggio: number;
  motivi: string;
  likes: number;
  commenti: number;
  url: string;
}

const ReviewRiskAnalysis = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [results, setResults] = useState<ReviewRisk[]>([]);
  const { toast } = useToast();

  const calculateRiskScore = (review: Review): { score: number; reasons: string[] } => {
    const reasons: string[] = [];
    let score = 0;

    const exp = review.experience || '';
    const expLength = exp.length;

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
      if (pattern.test(exp)) {
        score += weight;
        reasons.push(label);
      }
    });

    // Username pattern
    if (review.username && review.username.startsWith('Anonimo')) {
      score += 10;
      reasons.push('Username generato');
    }

    // Mancanza di emotività
    const hasEmotion = /[.]{2,}|[!?]{2,}|:\(|:\)|😭|😊/gi.test(exp);
    if (!hasEmotion) {
      score += 15;
      reasons.push('Zero emotività');
    }

    // Mancanza di dettagli specifici
    const hasSpecifics = /\d{4}|\d+\s*cm|\d+\s*mm|eparina|cardioaspirina|nn |xché | x /gi.test(exp);
    if (!hasSpecifics) {
      score += 15;
      reasons.push('Nessun dettaglio specifico');
    }

    // Tono troppo formale
    const formalTone = exp.split('.').length > 3 && expLength < 250;
    if (formalTone) {
      score += 10;
      reasons.push('Tono eccessivamente formale');
    }

    // Engagement basso
    if ((review.likes_count || 0) === 0 && (review.comments_count || 0) === 0) {
      score += 5;
      reasons.push('Zero engagement');
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

  const analyzeReviews = async () => {
    setIsAnalyzing(true);
    
    try {
      toast({
        title: "Analisi in corso...",
        description: "Recupero e analisi di tutte le recensioni",
      });

      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          symptoms,
          username,
          created_at,
          likes_count,
          comments_count,
          patologia
        `)
        .eq('status', 'approved')
        .order('id', { ascending: true });

      if (error) throw error;

      const analysisResults: ReviewRisk[] = [];

      reviews?.forEach((review) => {
        const { score, reasons } = calculateRiskScore(review as Review);
        const risk = getRiskCategory(score);
        
        const conditionSlug = (review.patologia || '').toLowerCase().replace(/\s+/g, '-');
        const titleSlug = review.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        const url = `https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}`;

        analysisResults.push({
          id: review.id,
          titolo: review.title,
          patologia: review.patologia || 'N/A',
          username: review.username || 'NULL',
          data_creazione: new Date(review.created_at).toLocaleDateString('it-IT'),
          lunghezza_esperienza: (review.experience || '').length,
          rischio: risk,
          punteggio: score,
          motivi: reasons.join('; '),
          likes: review.likes_count || 0,
          commenti: review.comments_count || 0,
          url: url
        });
      });

      // Ordina per punteggio decrescente
      analysisResults.sort((a, b) => b.punteggio - a.punteggio);

      // Calcola statistiche
      const statistics = {
        autentica: analysisResults.filter(r => r.rischio === 'AUTENTICA').length,
        basso: analysisResults.filter(r => r.rischio === 'BASSO').length,
        medio: analysisResults.filter(r => r.rischio === 'MEDIO').length,
        alto: analysisResults.filter(r => r.rischio === 'ALTO').length,
        critico: analysisResults.filter(r => r.rischio === 'CRITICO').length,
        totale: analysisResults.length
      };

      setStats(statistics);
      setResults(analysisResults);

      toast({
        title: "✅ Analisi completata!",
        description: `${statistics.totale} recensioni analizzate`,
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante l'analisi delle recensioni",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToExcel = async () => {
    if (results.length === 0) {
      toast({
        variant: "destructive",
        title: "Nessun dato",
        description: "Esegui prima l'analisi per esportare i dati",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Crea Excel
      const ws = XLSX.utils.json_to_sheet(results);
      ws['!cols'] = [
        { wch: 8 }, { wch: 50 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 60 }, { wch: 8 },
        { wch: 10 }, { wch: 80 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Analisi Rischio');

      // Foglio statistiche
      const statsData = [
        { Categoria: 'AUTENTICA', Conteggio: stats.autentica, Percentuale: `${(stats.autentica / stats.totale * 100).toFixed(1)}%` },
        { Categoria: 'BASSO', Conteggio: stats.basso, Percentuale: `${(stats.basso / stats.totale * 100).toFixed(1)}%` },
        { Categoria: 'MEDIO', Conteggio: stats.medio, Percentuale: `${(stats.medio / stats.totale * 100).toFixed(1)}%` },
        { Categoria: 'ALTO', Conteggio: stats.alto, Percentuale: `${(stats.alto / stats.totale * 100).toFixed(1)}%` },
        { Categoria: 'CRITICO', Conteggio: stats.critico, Percentuale: `${(stats.critico / stats.totale * 100).toFixed(1)}%` },
        { Categoria: 'TOTALE', Conteggio: stats.totale, Percentuale: '100%' }
      ];

      const wsStats = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiche');

      // Download
      const filename = `analisi-recensioni-rischio-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast({
        title: "✅ Report esportato!",
        description: `File ${filename} scaricato con successo`,
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante l'esportazione del report",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Analisi Rischio Recensioni AI</CardTitle>
          <CardDescription>
            Genera un report Excel con la classificazione di tutte le recensioni in base al rischio di essere identificate come AI-generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Criteri di valutazione:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Lunghezza del testo (brevi = più rischio)</li>
              <li>Pattern AI comuni ("è una malattia", "fondamentale", etc.)</li>
              <li>Mancanza di emotività (nessun "!!", "..", emoticon)</li>
              <li>Mancanza di dettagli specifici (date, misure, farmaci)</li>
              <li>Tono eccessivamente formale</li>
              <li>Username pattern "Anonimo[n]"</li>
              <li>Zero engagement (likes/commenti)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Categorie di rischio:</h3>
            <div className="grid grid-cols-5 gap-2 text-sm">
              <div className="p-3 bg-green-50 rounded text-center">
                <div className="font-bold text-green-700">AUTENTICA</div>
                <div className="text-xs text-green-600">0-14 punti</div>
              </div>
              <div className="p-3 bg-blue-50 rounded text-center">
                <div className="font-bold text-blue-700">BASSO</div>
                <div className="text-xs text-blue-600">15-29 punti</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded text-center">
                <div className="font-bold text-yellow-700">MEDIO</div>
                <div className="text-xs text-yellow-600">30-49 punti</div>
              </div>
              <div className="p-3 bg-orange-50 rounded text-center">
                <div className="font-bold text-orange-700">ALTO</div>
                <div className="text-xs text-orange-600">50-69 punti</div>
              </div>
              <div className="p-3 bg-red-50 rounded text-center">
                <div className="font-bold text-red-700">CRITICO</div>
                <div className="text-xs text-red-600">70+ punti</div>
              </div>
            </div>
          </div>

          {stats && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Risultati analisi:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-green-700 font-semibold">Autentiche:</span> {stats.autentica} ({(stats.autentica / stats.totale * 100).toFixed(1)}%)
                </div>
                <div>
                  <span className="text-blue-700 font-semibold">Basso rischio:</span> {stats.basso} ({(stats.basso / stats.totale * 100).toFixed(1)}%)
                </div>
                <div>
                  <span className="text-yellow-700 font-semibold">Medio rischio:</span> {stats.medio} ({(stats.medio / stats.totale * 100).toFixed(1)}%)
                </div>
                <div>
                  <span className="text-orange-700 font-semibold">Alto rischio:</span> {stats.alto} ({(stats.alto / stats.totale * 100).toFixed(1)}%)
                </div>
                <div>
                  <span className="text-red-700 font-semibold">Rischio critico:</span> {stats.critico} ({(stats.critico / stats.totale * 100).toFixed(1)}%)
                </div>
                <div>
                  <span className="font-semibold">Totale:</span> {stats.totale}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={analyzeReviews} 
              disabled={isAnalyzing}
              className="flex-1"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisi in corso...
                </>
              ) : (
                <>
                  Analizza Recensioni
                </>
              )}
            </Button>
            
            <Button 
              onClick={exportToExcel} 
              disabled={isExporting || results.length === 0}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Esportazione...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Esporta Report Excel
                </>
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Anteprima Recensioni a Rischio (Prime 50)</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results.slice(0, 50).map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 border rounded-lg ${
                      result.rischio === 'CRITICO' ? 'border-red-300 bg-red-50' :
                      result.rischio === 'ALTO' ? 'border-orange-300 bg-orange-50' :
                      result.rischio === 'MEDIO' ? 'border-yellow-300 bg-yellow-50' :
                      result.rischio === 'BASSO' ? 'border-blue-300 bg-blue-50' :
                      'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">ID {result.id}: {result.titolo}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.patologia} - {result.username}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold">{result.punteggio}</div>
                          <div className="text-xs text-muted-foreground">{result.rischio}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/reviews?highlight=${result.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Modifica
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Motivi: </span>
                        <span className="text-muted-foreground">{result.motivi}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Lunghezza: {result.lunghezza_esperienza} char</span>
                        <span>Likes: {result.likes}</span>
                        <span>Commenti: {result.commenti}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewRiskAnalysis;
