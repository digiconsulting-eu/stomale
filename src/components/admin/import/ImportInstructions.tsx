
export const ImportInstructions = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Istruzioni per l'importazione</h2>
      <p className="text-gray-600">
        Il file Excel deve contenere le seguenti colonne:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        <li><strong>Patologia</strong> (obbligatorio se non specificato ID) - Nome della patologia (verrà creata se non esiste)</li>
        <li><strong>Titolo</strong> (obbligatorio) - Titolo della recensione</li>
        <li><strong>Esperienza</strong> (obbligatorio) - Descrizione dell'esperienza</li>
        <li><strong>Sintomi</strong> (obbligatorio) - Descrizione dei sintomi</li>
        <li><strong>Patologia ID</strong> (alternativo a Patologia) - ID numerico della patologia esistente</li>
        <li><strong>Difficoltà Diagnosi</strong> - Valore da 1 a 5</li>
        <li><strong>Gravità Sintomi</strong> - Valore da 1 a 5</li>
        <li><strong>Ha Farmaco</strong> - Y/N o true/false</li>
        <li><strong>Efficacia Farmaco</strong> - Valore da 1 a 5</li>
        <li><strong>Possibilità Guarigione</strong> - Valore da 1 a 5</li>
        <li><strong>Disagio Sociale</strong> - Valore da 1 a 5</li>
      </ul>
      <p className="text-gray-600 mt-4">
        <strong>Note importanti:</strong>
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        <li>Puoi specificare il nome della patologia (colonna "Patologia") o l'ID (colonna "Patologia ID")</li>
        <li>Se specifichi il nome, la ricerca è case-insensitive ("diabete" = "Diabete" = "DIABETE")</li>
        <li>Se la patologia non esiste nel database, verrà creata automaticamente</li>
        <li>Se specifichi sia nome che ID, il nome ha priorità</li>
        <li>Vengono creati automaticamente utenti con username progressivi (Anonimo1, Anonimo2, ecc.)</li>
        <li>Le date vengono assegnate casualmente tra 1/1/2020 e 10/6/2025</li>
        <li>I campi opzionali ricevono valori casuali se non specificati</li>
        <li>Se importi molte recensioni, potrebbe richiedere alcuni secondi</li>
      </ul>
    </div>
  );
};
