const CookiePolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose max-w-none">
        <p>Ultima modifica: {new Date().toLocaleDateString()}</p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Cosa sono i cookie?</h2>
        <p>
          I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell'utente, dove vengono memorizzati, per poi essere ritrasmessi agli stessi siti alla visita successiva.
        </p>
        {/* Add more content as needed */}
      </div>
    </div>
  );
};

export default CookiePolicy;