interface DisclaimerProps {
  condition: string;
}

export const Disclaimer = ({ condition }: DisclaimerProps) => {
  return (
    <div className="bg-white rounded-lg p-6 text-sm text-text-light">
      <h2 className="text-lg font-semibold mb-4">{condition}</h2>
      <p className="mb-4">
        Scopri l'esperienza di chi soffre di {condition} grazie alle recensioni ed esperienze di altri utenti.
      </p>
      <p className="mb-4">
        Su StoMale.info puoi leggere le esperienze di utenti che hanno o hanno avuto a che fare con questa patologia. 
        Puoi leggere le loro esperienze, commentarle o fare domande e scoprire quali sintomi ha o come si sta curando 
        chi soffre di {condition}. Puoi inoltre confrontarti su esperti e cure, chiedendo anche di effetti 
        positivi oppure effetti collaterali o reazioni, tenendo però presente che si tratta di esperienze individuali 
        e che quindi bisognerà sempre rivolgersi al proprio medico curante per diagnosi e cura.
      </p>
      <p className="mb-4">
        Leggi le esperienze degli utenti che soffrono di {condition} e scopri come stanno.
      </p>
      <p className="mb-4">
        Gli utenti scrivono recensioni basate sulla propria esperienza personale e sotto diagnosi e consiglio medico, 
        questo sito quindi NON è inteso per consulenza medica, diagnosi o trattamento e NON deve in nessun caso 
        sostituirsi a un consulto medico, una visita specialistica o altro. StoMale.info e DigiConsulting non si 
        assumono responsabilità sulla libera interpretazione del contenuto scritto da altri utenti. E' doveroso 
        contattare il proprio medico e/o specialista per la diagnosi di malattie e per la prescrizione e assunzione 
        di farmaci.
      </p>
    </div>
  );
};