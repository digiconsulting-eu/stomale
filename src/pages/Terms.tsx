import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Terms = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(`
<h1>Termini e Condizioni di StoMale.info</h1>

<h2>Benvenuti su StoMale.info</h2>

<p>I presenti Termini e Condizioni regolano l'utilizzo del sito web StoMale.info (di seguito il "Sito"), gestito da DigiConsulting, P.IVA IT03720290364. Accedendo al Sito, l'utente accetta di rispettare i presenti Termini e Condizioni. Se non si accettano integralmente i Termini, si prega di non utilizzare il Sito.</p>

<h2>1. Definizione del Servizio</h2>

<p>StoMale.info è un sito dedicato a recensioni e informazioni su malattie, sintomi e salute generale. Le informazioni fornite hanno esclusivamente scopo informativo e non sostituiscono il parere di un medico o di un professionista sanitario qualificato.</p>

<h2>2. Utilizzo del Sito</h2>

<p>L'utente si impegna a:</p>

<ul>
<li>Utilizzare il Sito esclusivamente per scopi personali e non commerciali.</li>
<li>Non pubblicare contenuti illeciti, offensivi, diffamatori o che violino diritti di terzi.</li>
<li>Non compiere attività che possano compromettere il funzionamento del Sito (ad esempio, diffusione di malware, hacking, ecc.).</li>
</ul>

<p>DigiConsulting si riserva il diritto di sospendere o interrompere l'accesso al Sito agli utenti che violano i presenti Termini.</p>

<h2>3. Limitazioni di responsabilità</h2>

<p>Le informazioni presenti sul Sito sono pubblicate in buona fede e aggiornate regolarmente, ma DigiConsulting:</p>

<ul>
<li>Non garantisce la completezza, accuratezza o attualità dei contenuti.</li>
<li>Non è responsabile per eventuali danni derivanti dall’utilizzo delle informazioni pubblicate.</li>
<li>Declina ogni responsabilità per decisioni prese dagli utenti basate sui contenuti del Sito.</li>
</ul>

<p>L’utente è invitato a consultare un professionista sanitario qualificato per diagnosi e trattamenti specifici.</p>

<h2>4. Proprietà Intellettuale</h2>

<p>Tutti i contenuti presenti sul Sito (testi, immagini, loghi, marchi, design) sono di proprietà di DigiConsulting o dei rispettivi proprietari terzi e sono protetti dalle leggi sul diritto d’autore. È vietata la riproduzione, distribuzione o modifica non autorizzata dei contenuti senza il previo consenso scritto del titolare.</p>

<h2>5. Pubblicità e link a siti terzi</h2>

<p>Il Sito ospita annunci pubblicitari gestiti da terze parti (ad esempio, Google AdSense). DigiConsulting non è responsabile per i contenuti, i prodotti o i servizi offerti attraverso tali annunci. Eventuali link a siti web di terzi sono forniti esclusivamente per comodità dell'utente e DigiConsulting non garantisce il contenuto di tali siti.</p>

<h2>6. Modifiche ai Termini e Condizioni</h2>

<p>DigiConsulting si riserva il diritto di modificare in qualsiasi momento i presenti Termini e Condizioni. Eventuali modifiche saranno pubblicate su questa pagina con indicazione della data di aggiornamento. Si invita l’utente a consultare periodicamente questa pagina per verificare eventuali aggiornamenti.</p>

<h2>7. Legge applicabile e foro competente</h2>

<p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall’uso del Sito, il foro competente è quello della sede legale di DigiConsulting.</p>

<h2>8. Contatti</h2>

<p>Per ulteriori informazioni o domande sui presenti Termini e Condizioni, l'utente può contattare DigiConsulting ai seguenti recapiti:</p>

<p>Email: info@digiconsulting.eu</p>

<p>Indirizzo: Via Orti 14, Milano</p>

<p>Data ultimo aggiornamento: 16 dicembre 2024</p>
  `);

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

export default Terms;
