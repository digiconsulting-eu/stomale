const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Termini e Condizioni</h1>
      <div className="prose max-w-none">
        <p>Ultima modifica: {new Date().toLocaleDateString()}</p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Condizioni Generali di Utilizzo</h2>
        <p>
          Le presenti condizioni generali di utilizzo regolano l'accesso e l'utilizzo del sito web StoMale.info.
        </p>
        {/* Add more content as needed */}
      </div>
    </div>
  );
};

export default Terms;