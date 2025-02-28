
# Generazione Automatica delle Sitemap

Questo progetto include un sistema automatizzato per generare sitemap per il sito stomale.info.

## Funzionamento

Le sitemap vengono generate automaticamente tramite GitHub Actions nei seguenti casi:
- Ogni domenica a mezzanotte (programmato)
- Manualmente avviando il workflow "Generate Sitemaps" da GitHub

## Come funziona

1. Lo script `generateSitemaps.js` si connette al database Supabase
2. Recupera tutti gli URL delle recensioni dalla tabella `review_urls`
3. Genera più file sitemap (5 URL per file) nella cartella `public/`
4. Aggiorna il file principale `sitemap.xml` per includere tutti i file generati

## Esecuzione manuale

Per eseguire manualmente la generazione delle sitemap:

1. Vai alla sezione "Actions" del repository su GitHub
2. Seleziona il workflow "Generate Sitemaps"
3. Clicca su "Run workflow"
4. Seleziona il branch e conferma

## Requisiti

Il workflow richiede i seguenti segreti configurati su GitHub:
- `SUPABASE_URL`: L'URL del progetto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: La chiave di servizio di Supabase

## Struttura dei file

- `.github/workflows/generate-sitemaps.yml`: Configurazione del workflow GitHub Actions
- `scripts/generateSitemaps.js`: Script Node.js che genera le sitemap
- `public/sitemap-reviews-*.xml`: File delle sitemap generati
- `public/sitemap.xml`: File principale che elenca tutte le sitemap
