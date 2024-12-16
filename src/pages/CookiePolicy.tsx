import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CookiePolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(`
<h1>Cookie Policy di StoMale.info</h1>

<h2>Introduzione</h2>

<p>La presente Cookie Policy descrive l'uso dei cookie e tecnologie similari sul sito web StoMale.info (di seguito il "Sito"), gestito da DigiConsulting, P.IVA IT03720290364. Utilizzando il Sito, l'utente accetta l'utilizzo dei cookie in conformità con quanto descritto nella presente informativa.</p>

<h2>Cosa sono i cookie?</h2>

<p>I cookie sono piccoli file di testo che vengono salvati sul dispositivo dell'utente (computer, smartphone, tablet) durante la navigazione su un sito web. Essi servono a migliorare l'esperienza dell'utente, a raccogliere informazioni statistiche e, in alcuni casi, a fornire contenuti pubblicitari personalizzati.</p>

<h2>Tipologie di cookie utilizzati</h2>

<p>Il Sito utilizza le seguenti categorie di cookie:</p>

<h3>Cookie tecnici:</h3>
<p>Questi cookie sono essenziali per il funzionamento del Sito e consentono all'utente di navigare e utilizzare le sue funzionalità principali (ad esempio, accedere ad aree riservate o salvare preferenze). Senza questi cookie, il Sito potrebbe non funzionare correttamente.</p>

<h3>Cookie di performance e analisi:</h3>
<p>Questi cookie raccolgono informazioni anonime sull'uso del Sito, come le pagine più visitate o eventuali errori riscontrati. Utilizziamo strumenti come Google Analytics per analizzare e migliorare le performance del Sito. Le informazioni raccolte sono aggregate e non consentono di identificare personalmente gli utenti.</p>

<h3>Cookie di profilazione e pubblicità:</h3>
<p>Il Sito ospita pubblicità gestite da terze parti, che possono utilizzare cookie per mostrare annunci personalizzati in base agli interessi dell'utente. Questi cookie tracciano la navigazione dell'utente sul Sito e su altri siti web.</p>

<p>Le terze parti che gestiscono i cookie pubblicitari includono, a titolo esemplificativo, Google AdSense. Per ulteriori informazioni sul funzionamento dei cookie pubblicitari di Google, è possibile consultare la pagina: Google AdSense Policy.</p>

<h2>Gestione dei cookie</h2>

<p>L'utente può gestire o disabilitare i cookie attraverso le impostazioni del proprio browser. Di seguito, alcune risorse utili per configurare i principali browser:</p>

<ul>
<li>Google Chrome</li>
<li>Mozilla Firefox</li>
<li>Apple Safari</li>
<li>Microsoft Edge</li>
</ul>

<p>La disabilitazione dei cookie potrebbe influire negativamente sull'esperienza di navigazione del Sito e su alcune funzionalità.</p>

<h2>Cookie di terze parti</h2>

<p>Il Sito potrebbe contenere collegamenti a siti web di terze parti o componenti integrati (ad esempio, video, pulsanti di condivisione social). Questi elementi possono impostare cookie propri, non controllati da DigiConsulting. Si raccomanda di consultare le rispettive informative sulla privacy e sui cookie di tali soggetti terzi.</p>

<h2>Aggiornamenti alla Cookie Policy</h2>

<p>DigiConsulting si riserva il diritto di modificare questa Cookie Policy in qualsiasi momento. Eventuali modifiche verranno pubblicate su questa pagina con la data di aggiornamento. Si consiglia di consultare periodicamente questa pagina per verificare eventuali aggiornamenti.</p>

<h2>Contatti</h2>

<p>Per ulteriori informazioni sull'uso dei cookie o sulla gestione dei dati personali, è possibile contattare DigiConsulting ai seguenti recapiti:</p>

<p>Email: info@digiconsulting.eu</p>

<p>Data ultimo aggiornamento: 16 dicembre 2024</p>
  `);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('type', 'cookie_policy')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cookie policy:', error);
        toast.error("Errore durante il caricamento della cookie policy");
        return;
      }

      if (data?.content) {
        setContent(data.content);
      } else {
        // If no content exists, create default content
        const { error: insertError } = await supabase
          .from('site_content')
          .insert({
            type: 'cookie_policy',
            content: content
          });

        if (insertError) {
          console.error('Error inserting default cookie policy:', insertError);
          toast.error("Errore durante l'inizializzazione della cookie policy");
        }
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_content')
      .upsert({
        type: 'cookie_policy',
        content: content,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving cookie policy:', error);
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
      <div className="prose max-w-none">
        <RichTextEditor 
          content={content} 
          onChange={() => {}} 
          editable={false} 
        />
      </div>
    </div>
  );
};

export default CookiePolicy;