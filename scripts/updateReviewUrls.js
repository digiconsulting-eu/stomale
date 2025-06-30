
const { createClient } = require('@supabase/supabase-js');

const updateReviewUrls = async () => {
  try {
    console.log('Aggiornamento degli URL delle recensioni...');
    
    // Inizializza il client Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Le variabili di ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere definite');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch delle recensioni approvate usando la nuova colonna patologia
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, title, patologia')
      .filter('status', 'eq', 'approved')
      .not('patologia', 'is', null)
      .order('id');
    
    if (error) {
      throw error;
    }
    
    if (!reviews || !reviews.length) {
      console.log('Nessuna recensione trovata');
      return;
    }
    
    console.log(`Trovate ${reviews.length} recensioni`);
    
    // Funzione per slugificare i titoli
    const slugify = (text) => {
      if (!text) return '';
      return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .substring(0, 70);
    };
    
    // Costruisci gli URL delle recensioni usando il nuovo formato
    const reviewUrls = reviews.map(review => {
      const condition = review.patologia;
      // Usa encodeURIComponent per codificare gli spazi e caratteri speciali
      const encodedCondition = encodeURIComponent(condition.toLowerCase().trim());
      
      const title = review.title || '';
      const titleSlug = slugify(title);
      
      return {
        review_id: review.id,
        url: `/patologia/${encodedCondition}/esperienza/${review.id}-${titleSlug}`,
        condition: condition,
        title: title
      };
    });
    
    console.log(`Generati ${reviewUrls.length} URL di recensioni`);
    
    // Prima, pulisci la tabella review_urls esistente
    console.log('Pulendo la tabella review_urls...');
    const { error: deleteError } = await supabase
      .from('review_urls')
      .delete()
      .neq('id', 0); // Elimina tutti i record
    
    if (deleteError) {
      console.error('Errore nella pulizia della tabella:', deleteError);
      // Continua comunque
    }
    
    // Inserisci i nuovi URL nella tabella review_urls in batch
    console.log('Inserendo nuovi URL nella tabella review_urls...');
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < reviewUrls.length; i += batchSize) {
      const batch = reviewUrls.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('review_urls')
        .insert(batch);
      
      if (insertError) {
        console.error(`Errore nell'inserimento del batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      console.log(`Inseriti ${inserted}/${reviewUrls.length} URL`);
    }
    
    console.log('Aggiornamento completato con successo!');
    console.log(`Totale URL inseriti: ${inserted}`);
    
  } catch (error) {
    console.error('Errore durante l\'aggiornamento degli URL:', error.message);
    process.exit(1);
  }
};

// Esegui solo se chiamato direttamente
if (require.main === module) {
  updateReviewUrls();
}

module.exports = updateReviewUrls;
