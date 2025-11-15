import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = 'https://hnuhdoycwpjfjhthfqbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0';

const supabase = createClient(supabaseUrl, supabaseKey);

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

function calculateRiskScore(review: Review): { score: number; reasons: string[] } {
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

  // Engagement basso (potrebbe essere sospetto)
  if ((review.likes_count || 0) === 0 && (review.comments_count || 0) === 0) {
    score += 5;
    reasons.push('Zero engagement');
  }

  return { score, reasons };
}

function getRiskCategory(score: number): string {
  if (score >= 70) return 'CRITICO';
  if (score >= 50) return 'ALTO';
  if (score >= 30) return 'MEDIO';
  if (score >= 15) return 'BASSO';
  return 'AUTENTICA';
}

async function analyzeReviews() {
  console.log('Fetching reviews...');
  
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

  if (error) {
    console.error('Error fetching reviews:', error);
    return;
  }

  console.log(`Analyzing ${reviews?.length || 0} reviews...`);

  const analysisResults: ReviewRisk[] = [];

  reviews?.forEach((review) => {
    const { score, reasons } = calculateRiskScore(review as Review);
    const risk = getRiskCategory(score);
    
    // Genera URL
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

  // Crea worksheet
  const ws = XLSX.utils.json_to_sheet(analysisResults);

  // Imposta larghezza colonne
  ws['!cols'] = [
    { wch: 8 },   // ID
    { wch: 50 },  // Titolo
    { wch: 30 },  // Patologia
    { wch: 15 },  // Username
    { wch: 12 },  // Data
    { wch: 10 },  // Lunghezza
    { wch: 10 },  // Rischio
    { wch: 10 },  // Punteggio
    { wch: 60 },  // Motivi
    { wch: 8 },   // Likes
    { wch: 10 },  // Commenti
    { wch: 80 }   // URL
  ];

  // Crea workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Analisi Rischio');

  // Aggiungi foglio statistiche
  const stats = [
    { Categoria: 'AUTENTICA', Conteggio: analysisResults.filter(r => r.rischio === 'AUTENTICA').length, Percentuale: `${(analysisResults.filter(r => r.rischio === 'AUTENTICA').length / analysisResults.length * 100).toFixed(1)}%` },
    { Categoria: 'BASSO', Conteggio: analysisResults.filter(r => r.rischio === 'BASSO').length, Percentuale: `${(analysisResults.filter(r => r.rischio === 'BASSO').length / analysisResults.length * 100).toFixed(1)}%` },
    { Categoria: 'MEDIO', Conteggio: analysisResults.filter(r => r.rischio === 'MEDIO').length, Percentuale: `${(analysisResults.filter(r => r.rischio === 'MEDIO').length / analysisResults.length * 100).toFixed(1)}%` },
    { Categoria: 'ALTO', Conteggio: analysisResults.filter(r => r.rischio === 'ALTO').length, Percentuale: `${(analysisResults.filter(r => r.rischio === 'ALTO').length / analysisResults.length * 100).toFixed(1)}%` },
    { Categoria: 'CRITICO', Conteggio: analysisResults.filter(r => r.rischio === 'CRITICO').length, Percentuale: `${(analysisResults.filter(r => r.rischio === 'CRITICO').length / analysisResults.length * 100).toFixed(1)}%` },
    { Categoria: 'TOTALE', Conteggio: analysisResults.length, Percentuale: '100%' }
  ];

  const wsStats = XLSX.utils.json_to_sheet(stats);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiche');

  // Salva file
  const filename = `analisi-recensioni-rischio-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, `public/${filename}`);

  console.log(`\n✅ Analisi completata!`);
  console.log(`📊 File generato: public/${filename}`);
  console.log(`\nStatistiche:`);
  stats.forEach(stat => {
    console.log(`${stat.Categoria}: ${stat.Conteggio} (${stat.Percentuale})`);
  });
  console.log(`\n🔗 Download: https://stomale.info/${filename}`);
}

analyzeReviews().catch(console.error);
