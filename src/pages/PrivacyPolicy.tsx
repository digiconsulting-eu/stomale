import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PrivacyPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(`
<h1>Privacy Policy di StoMale.info</h1>

<h2>Introduzione</h2>

<p>La presente Privacy Policy descrive le modalità di trattamento dei dati personali raccolti attraverso il sito web StoMale.info (di seguito il "Sito"), gestito da DigiConsulting, P.IVA IT03720290364, in conformità al Regolamento Generale sulla Protezione dei Dati (GDPR) e alle normative italiane vigenti in materia di privacy.</p>

<p>Utilizzando il Sito, l'utente accetta quanto descritto nella presente informativa.</p>

<h2>Titolare del trattamento</h2>

<p>Il titolare del trattamento dei dati è DigiConsulting, con sede in:</p>

<p>Email: info@digiconsulting.eu</p>

<h2>Tipologie di dati raccolti</h2>

<p>Il Sito può raccogliere diverse tipologie di dati personali, che vengono forniti direttamente dagli utenti o acquisiti automaticamente durante la navigazione:</p>

<h3>Dati forniti volontariamente dall'utente:</h3>

<ul>
<li>Nome, cognome, indirizzo email e altre informazioni fornite attraverso i moduli di contatto o registrazione presenti sul Sito.</li>
<li>Contenuti dei messaggi inviati dagli utenti tramite il Sito.</li>
</ul>

<h3>Dati raccolti automaticamente:</h3>

<ul>
<li>Indirizzo IP, tipo di browser, sistema operativo, dati di navigazione e comportamento sul Sito.</li>
<li>Cookie e tecnologie similari (vedi Cookie Policy per dettagli).</li>
</ul>

<h2>Finalità del trattamento</h2>

<p>I dati personali raccolti vengono utilizzati per le seguenti finalità:</p>

<ul>
<li>Fornire i servizi richiesti dagli utenti, come la pubblicazione di recensioni e la risposta alle richieste inviate tramite moduli di contatto.</li>
<li>Migliorare l'esperienza di navigazione e il funzionamento del Sito.</li>
<li>Inviare comunicazioni commerciali o promozionali relative ai servizi di StoMale.info, previo consenso esplicito dell'utente.</li>
<li>Analizzare il traffico e il comportamento degli utenti per finalità statistiche e di marketing.</li>
<li>Adempiere a obblighi di legge.</li>
</ul>

<h2>Base giuridica del trattamento</h2>

<p>Il trattamento dei dati personali avviene sulla base di:</p>

<ul>
<li>Il consenso dell’utente per finalità di marketing o invio di comunicazioni promozionali.</li>
<li>La necessità di eseguire un contratto o soddisfare una richiesta dell’utente.</li>
<li>Gli obblighi legali a cui DigiConsulting è soggetta.</li>
<li>Il legittimo interesse del titolare, ad esempio per garantire la sicurezza del Sito o migliorare i propri servizi.</li>
</ul>

<h2>Conservazione dei dati</h2>

<p>I dati personali saranno conservati per il tempo strettamente necessario a soddisfare le finalità indicate o per adempiere agli obblighi di legge. In caso di consenso al trattamento per finalità di marketing, i dati saranno conservati fino alla revoca dello stesso.</p>

<h2>Condivisione dei dati</h2>

<p>I dati personali potranno essere condivisi con:</p>

<ul>
<li>Fornitori di servizi esterni che supportano DigiConsulting nella gestione del Sito e nell’erogazione dei servizi (ad esempio, hosting provider, servizi di analisi).</li>
<li>Autorità competenti, laddove richiesto dalla legge.</li>
<li>Partner pubblicitari, per la personalizzazione e l’erogazione di annunci pubblicitari sul Sito.</li>
</ul>

<h2>Trasferimento dei dati verso paesi terzi</h2>

<p>Qualora i dati personali siano trasferiti verso paesi al di fuori dello Spazio Economico Europeo (SEE), DigiConsulting garantirà che il trasferimento avvenga in conformità alle normative applicabili, ad esempio attraverso clausole contrattuali standard approvate dalla Commissione Europea.</p>

<h2>Diritti dell’utente</h2>

<p>Gli utenti hanno il diritto di:</p>

<ul>
<li>Accedere ai propri dati personali e ottenere una copia degli stessi.</li>
<li>Rettificare dati inesatti o incompleti.</li>
<li>Richiedere la cancellazione dei propri dati personali (diritto all’oblio), ove applicabile.</li>
<li>Opporsi al trattamento dei dati personali per motivi legittimi.</li>
<li>Limitare il trattamento dei dati personali, ove previsto dalla normativa.</li>
<li>Revocare il consenso al trattamento, senza pregiudicare la liceità del trattamento basata sul consenso prima della revoca.</li>
<li>Presentare un reclamo all’autorità di controllo competente (in Italia, il Garante per la Protezione dei Dati Personali).</li>
</ul>

<p>Per esercitare i propri diritti, è possibile contattare DigiConsulting tramite email all'indirizzo info@digiconsulting.eu.</p>

<h2>Sicurezza dei dati</h2>

<p>DigiConsulting adotta misure tecniche e organizzative adeguate per proteggere i dati personali da accessi non autorizzati, perdite, alterazioni o divulgazioni.</p>

<h2>Aggiornamenti alla Privacy Policy</h2>

<p>DigiConsulting si riserva il diritto di modificare la presente Privacy Policy in qualsiasi momento. Eventuali modifiche verranno pubblicate su questa pagina con la data di aggiornamento. Si invita a consultare periodicamente questa pagina per verificare eventuali aggiornamenti.</p>

<h2>Contatti</h2>

<p>Per ulteriori informazioni sul trattamento dei dati personali, è possibile contattare DigiConsulting ai seguenti recapiti:</p>

<p>Email: info@digiconsulting.eu</p>

<p>Data ultimo aggiornamento: 16 dicembre 2024</p>
  `);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'privacy_policy')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching privacy policy:', error);
        toast.error("Errore durante il caricamento della privacy policy");
        return;
      }

      // If no data exists, create default privacy policy
      if (!data) {
        const { error: insertError } = await supabase
          .from('site_content')
          .insert({
            type: 'privacy_policy',
            content: content,
          });

        if (insertError) {
          console.error('Error inserting default privacy policy:', insertError);
          toast.error("Errore durante l'inizializzazione della privacy policy");
          return;
        }
      } else if (data?.content) {
        setContent(data.content);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_content')
      .upsert({
        type: 'privacy_policy',
        content: content,
      });

    if (error) {
      toast.error("Errore durante il salvataggio");
      return;
    }

    setIsEditing(false);
    toast.success("Contenuto salvato con successo");
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isEditing && (
        <Button onClick={() => setIsEditing(true)} className="mb-4">
          Modifica Contenuto
        </Button>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <RichTextEditor 
            content={content} 
            onChange={handleContentChange} 
            editable={true} 
          />
          <div className="space-x-2">
            <Button onClick={handleSave}>Salva</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annulla
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <RichTextEditor 
            content={content} 
            onChange={() => {}} 
            editable={false} 
          />
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;
