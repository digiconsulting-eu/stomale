const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p>Ultima modifica: {new Date().toLocaleDateString()}</p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Informativa sulla Privacy</h2>
        <p>
          La presente informativa descrive le modalità di gestione del sito web in riferimento al trattamento dei dati personali degli utenti che lo consultano.
        </p>
        {/* Add more content as needed */}
      </div>
    </div>
  );
};

export default PrivacyPolicy;