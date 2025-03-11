
export const ImportInstructions = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Istruzioni per l'importazione</h2>
      <p className="text-gray-600">
        Il file Excel deve contenere le seguenti colonne:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        <li><strong>Patologia</strong> (obbligatorio) - Nome della patologia</li>
        <li><strong>Esperienza</strong> (obbligatorio) - Descrizione dell'esperienza</li>
        <li><strong>Titolo</strong> - Titolo della recensione</li>
        <li><strong>Sintomi</strong> - Descrizione dei sintomi</li>
        <li><strong>Difficoltà diagnosi</strong> - Valore da 1 a 5</li>
        <li><strong>Fastidio sintomi</strong> - Valore da 1 a 5</li>
        <li><strong>Cura Farmacologica</strong> - Y/N</li>
        <li><strong>Efficacia farmaci</strong> - Valore da 1 a 5</li>
        <li><strong>Possibilità guarigione</strong> - Valore da 1 a 5</li>
        <li><strong>Disagio sociale</strong> - Valore da 1 a 5</li>
        <li><strong>Data</strong> - Data della recensione (opzionale)</li>
      </ul>
      <p className="text-gray-600 mt-4">
        <strong>Note importanti:</strong>
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        <li>Se non specifichi un User ID, verrà utilizzato l'utente attualmente loggato</li>
        <li>Se la patologia non esiste nel database, verrà creata automaticamente</li>
        <li>I campi numerici devono essere valori da 1 a 5</li>
        <li>Se importi molte recensioni, potrebbe richiedere alcuni secondi</li>
      </ul>
    </div>
  );
};
