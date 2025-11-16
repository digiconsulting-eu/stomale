import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Loader2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';

interface Review {
  id: number;
  title: string;
  experience: string;
  symptoms: string;
  username: string;
  patologia: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface SEOIssue {
  reviewId: number;
  title: string;
  username: string;
  patologia: string;
  score: number;
  category: string;
  issues: string[];
  recommendations: string[];
  impactLevel: 'BASSO' | 'MEDIO' | 'ALTO' | 'CRITICO';
}

const ReviewSEOAnalysis = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState<SEOIssue[]>([]);
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [impactFilter, setImpactFilter] = useState<string>('all');

  const analyzeSEO = (review: Review): SEOIssue => {
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    const contentLength = review.experience.length + review.symptoms.length;
    const wordCount = (review.experience + ' ' + review.symptoms).split(/\s+/).length;

    // 1. Analisi lunghezza contenuto
    if (contentLength < 150) {
      score -= 30;
      issues.push("Contenuto troppo breve (thin content)");
      recommendations.push("Espandere a minimo 300 caratteri per evitare penalizzazioni thin content");
    } else if (contentLength < 300) {
      score -= 15;
      issues.push("Contenuto scarso");
      recommendations.push("Aggiungere più dettagli e contesto");
    }

    // 2. Analisi duplicazione
    const normalizedText = review.experience.toLowerCase();
    const commonPhrases = [
      'ho questa malattia',
      'soffro di questa patologia',
      'sono affetto da',
      'ho scoperto di avere'
    ];
    
    let duplicateCount = 0;
    commonPhrases.forEach(phrase => {
      if (normalizedText.includes(phrase)) duplicateCount++;
    });

    if (duplicateCount >= 2) {
      score -= 20;
      issues.push("Uso eccessivo di frasi comuni (possibile contenuto duplicato)");
      recommendations.push("Rendere il contenuto più unico e personale");
    }

    // 3. Analisi keyword stuffing
    const titleWords = review.title.toLowerCase().split(/\s+/);
    const textWords = normalizedText.split(/\s+/);
    const patologiaLower = review.patologia?.toLowerCase() || '';
    
    const titleKeywordCount = titleWords.filter(w => w === patologiaLower).length;
    const textKeywordDensity = textWords.filter(w => w === patologiaLower).length / wordCount;

    if (titleKeywordCount > 2) {
      score -= 25;
      issues.push("Keyword stuffing nel titolo");
      recommendations.push("Ridurre la ripetizione della patologia nel titolo");
    }

    if (textKeywordDensity > 0.05) {
      score -= 20;
      issues.push("Densità keyword eccessiva nel testo");
      recommendations.push("Variare il linguaggio e usare sinonimi");
    }

    // 4. Analisi qualità titolo
    if (review.title.length < 20) {
      score -= 15;
      issues.push("Titolo troppo corto");
      recommendations.push("Espandere il titolo a 40-60 caratteri");
    } else if (review.title.length > 70) {
      score -= 10;
      issues.push("Titolo troppo lungo (troncato nei risultati)");
      recommendations.push("Ridurre il titolo a max 60 caratteri");
    }

    // 5. Analisi engagement
    const daysSinceCreation = Math.floor((Date.now() - new Date(review.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const engagementScore = (review.likes_count + review.comments_count * 2) / Math.max(daysSinceCreation, 1);

    if (engagementScore < 0.01 && daysSinceCreation > 30) {
      score -= 15;
      issues.push("Basso engagement (segnale negativo per Google)");
      recommendations.push("Promuovere il contenuto per aumentare interazioni");
    }

    // 6. Analisi struttura
    const hasParagraphs = review.experience.includes('\n') || review.experience.length > 500;
    if (!hasParagraphs && wordCount > 50) {
      score -= 10;
      issues.push("Manca struttura con paragrafi");
      recommendations.push("Organizzare il testo in paragrafi");
    }

    // 7. Analisi autore
    if (!review.username || review.username === 'anonymous') {
      score -= 20;
      issues.push("Contenuto anonimo (E-A-T negativo)");
      recommendations.push("Incoraggiare autori identificabili per migliorare E-A-T");
    }

    // 8. Analisi freschezza
    if (daysSinceCreation > 365) {
      score -= 10;
      issues.push("Contenuto datato (oltre 1 anno)");
      recommendations.push("Aggiornare con informazioni recenti");
    }

    // 9. Analisi caratteri speciali e formattazione
    const specialCharsCount = (review.experience.match(/[^a-zA-Z0-9\s.,!?;:()-]/g) || []).length;
    if (specialCharsCount > wordCount * 0.1) {
      score -= 15;
      issues.push("Uso eccessivo di caratteri speciali");
      recommendations.push("Ridurre caratteri speciali e emoji");
    }

    // 10. Analisi valore informativo
    const infoKeywords = [
      'sintomo', 'diagnosi', 'cura', 'trattamento', 'medico', 
      'terapia', 'farmaco', 'ospedale', 'esame', 'dottore'
    ];
    const infoKeywordCount = infoKeywords.filter(kw => 
      normalizedText.includes(kw)
    ).length;

    if (infoKeywordCount < 2) {
      score -= 15;
      issues.push("Basso valore informativo medico");
      recommendations.push("Aggiungere più dettagli su sintomi, diagnosi e trattamenti");
    }

    // Determina categoria impatto
    let impactLevel: 'BASSO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    if (score >= 80) impactLevel = 'BASSO';
    else if (score >= 60) impactLevel = 'MEDIO';
    else if (score >= 40) impactLevel = 'ALTO';
    else impactLevel = 'CRITICO';

    // Determina categoria principale
    let category = 'Ottima';
    if (score < 40) category = 'Penalizzazione Alta';
    else if (score < 60) category = 'Rischio Penalizzazione';
    else if (score < 80) category = 'Migliorabile';

    return {
      reviewId: review.id,
      title: review.title,
      username: review.username,
      patologia: review.patologia,
      score,
      category,
      issues,
      recommendations,
      impactLevel
    };
  };

  const getFilteredResults = () => {
    if (impactFilter === 'all') return results;
    if (impactFilter === 'alto') return results.filter(r => r.impactLevel === 'CRITICO' || r.impactLevel === 'ALTO');
    if (impactFilter === 'medio') return results.filter(r => r.impactLevel === 'MEDIO');
    if (impactFilter === 'basso') return results.filter(r => r.impactLevel === 'BASSO');
    return results;
  };

  const analyzeReviews = async () => {
    setIsAnalyzing(true);
    toast.info("Inizio analisi SEO...");

    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, title, experience, symptoms, username, patologia, created_at, likes_count, comments_count')
        .eq('status', 'approved');

      if (error) throw error;
      if (!reviews || reviews.length === 0) {
        toast.error("Nessuna recensione trovata");
        return;
      }

      toast.info(`Analisi di ${reviews.length} recensioni in corso...`);

      const analyzed = reviews.map(review => analyzeSEO(review));
      
      // Ordina per score crescente (problemi peggiori prima)
      analyzed.sort((a, b) => a.score - b.score);

      // Calcola statistiche
      const statsData = {
        'Totale Recensioni': reviews.length,
        'Penalizzazione Alta': analyzed.filter(a => a.impactLevel === 'CRITICO').length,
        'Rischio Alto': analyzed.filter(a => a.impactLevel === 'ALTO').length,
        'Rischio Medio': analyzed.filter(a => a.impactLevel === 'MEDIO').length,
        'Rischio Basso': analyzed.filter(a => a.impactLevel === 'BASSO').length,
        'Score Medio': Math.round(analyzed.reduce((sum, a) => sum + a.score, 0) / analyzed.length)
      };

      setResults(analyzed);
      setStats(statsData);

      toast.success("Analisi completata!");
    } catch (error) {
      console.error('Errore durante analisi:', error);
      toast.error("Errore durante l'analisi");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToExcel = async () => {
    if (results.length === 0) {
      toast.error("Esegui prima l'analisi per esportare i dati");
      return;
    }

    setIsExporting(true);
    
    try {
      // Crea Excel
      const detailData = results.map(item => ({
        'ID Recensione': item.reviewId,
        'Titolo': item.title,
        'Autore': item.username,
        'Patologia': item.patologia,
        'Score SEO': item.score,
        'Livello Impatto': item.impactLevel,
        'Categoria': item.category,
        'Problemi': item.issues.join('; '),
        'Raccomandazioni': item.recommendations.join('; ')
      }));

      const statsSheetData = Object.entries(stats).map(([key, value]) => ({
        'Metrica': key,
        'Valore': value
      }));

      const wb = XLSX.utils.book_new();
      const wsDetail = XLSX.utils.json_to_sheet(detailData);
      const wsStats = XLSX.utils.json_to_sheet(statsSheetData);
      
      XLSX.utils.book_append_sheet(wb, wsDetail, "Analisi Dettagliata");
      XLSX.utils.book_append_sheet(wb, wsStats, "Statistiche");
      
      XLSX.writeFile(wb, `analisi_seo_recensioni_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success("Report esportato con successo!");
    } catch (error) {
      console.error('Errore durante esportazione:', error);
      toast.error("Errore durante l'esportazione");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      
      <Card>
        <CardHeader>
          <CardTitle>Analisi SEO Recensioni - Penalizzazioni Google</CardTitle>
          <CardDescription>
            Analizza le recensioni secondo i criteri di ranking e penalizzazione di Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-semibold">Criteri di Valutazione SEO per UGC:</h3>
            <ul className="space-y-2 text-sm">
              <li><strong>Thin Content:</strong> Lunghezza minima per evitare penalizzazioni Google</li>
              <li><strong>Keyword Stuffing:</strong> Ripetizione eccessiva della patologia nel titolo/testo</li>
              <li><strong>Qualità Titolo:</strong> Lunghezza ottimale per SERP (30-60 caratteri)</li>
              <li><strong>Engagement:</strong> Likes e commenti come segnale di qualità utente</li>
              <li><strong>Contenuto Generico:</strong> Frasi troppo comuni che riducono l'unicità</li>
              <li><strong>Autenticità UGC:</strong> Dettagli specifici e linguaggio personale</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3 italic">
              <strong>Nota importante:</strong> Questa analisi è ottimizzata per User Generated Content. 
              NON penalizza la mancanza di struttura professionale, paragrafi formali o linguaggio medico tecnico, 
              che sono normali nelle recensioni autentiche degli utenti. Le recensioni personali NON sono articoli professionali.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Questa analisi NON valuta se il contenuto è generato da AI. 
              Per l'analisi AI usa la pagina "Analisi Rischi AI".
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Livelli di Impatto:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-red-100 p-2 rounded">
                <strong>CRITICO (0-39):</strong> Alta probabilità di penalizzazione
              </div>
              <div className="bg-orange-100 p-2 rounded">
                <strong>ALTO (40-59):</strong> Rischio significativo
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                <strong>MEDIO (60-79):</strong> Miglioramenti raccomandati
              </div>
              <div className="bg-green-100 p-2 rounded">
                <strong>BASSO (80-100):</strong> Buona qualità SEO
              </div>
            </div>
          </div>

          {stats && Object.keys(stats).length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Statistiche Analisi:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded shadow-sm">
                    <div className="text-muted-foreground">{key}</div>
                    <div className="text-2xl font-bold">{value}</div>
                  </div>
                ))}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Anteprima Recensioni con Problemi SEO</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filtra per impatto:</span>
                  <Select value={impactFilter} onValueChange={setImpactFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tutti i livelli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i livelli</SelectItem>
                      <SelectItem value="alto">Alto (Critico + Alto)</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="basso">Basso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                {getFilteredResults().slice(0, 50).map(result => (
                  <div 
                    key={result.reviewId}
                    className={`p-4 rounded-lg border-l-4 ${
                      result.impactLevel === 'CRITICO' ? 'border-red-500 bg-red-50' :
                      result.impactLevel === 'ALTO' ? 'border-orange-500 bg-orange-50' :
                      result.impactLevel === 'MEDIO' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">ID {result.reviewId}: {result.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.patologia} - {result.username}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold">{result.score}</div>
                          <div className="text-xs text-muted-foreground">{result.impactLevel}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/reviews?highlight=${result.reviewId}&edit=1`)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Modifica
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Problemi:</strong> {result.issues.join(', ')}</div>
                      <div className="text-muted-foreground"><strong>Raccomandazioni:</strong> {result.recommendations.join(', ')}</div>
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

export default ReviewSEOAnalysis;
