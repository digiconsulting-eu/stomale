
export const FaqSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
          Domande frequenti
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Cos'è StoMale.info?</h3>
              <p>StoMale.info è una piattaforma dove le persone possono condividere le proprie esperienze con malattie e patologie, aiutando altri pazienti a comprendere meglio sintomi, diagnosi e trattamenti da una prospettiva umana e personale.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Come posso scrivere una recensione?</h3>
              <p>Puoi facilmente condividere la tua esperienza cliccando sul pulsante "Scrivi una recensione" e compilando il modulo con i dettagli della tua esperienza, della patologia e dei sintomi riscontrati.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Le informazioni sono verificate da medici?</h3>
              <p>Le recensioni su StoMale.info sono esperienze personali e non sostituiscono il parere medico. Ti consigliamo sempre di consultare professionisti sanitari per diagnosi e trattamenti.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Come posso trovare recensioni su una patologia specifica?</h3>
              <p>Puoi utilizzare la barra di ricerca nella parte superiore della pagina, oppure navigare tra le categorie di patologie nella sezione "Esplora patologie".</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
