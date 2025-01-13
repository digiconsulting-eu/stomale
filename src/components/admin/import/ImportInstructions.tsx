export const ImportInstructions = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Istruzioni per l'importazione</h3>
      <div className="prose prose-sm max-w-none">
        <p>
          Il file Excel deve contenere le seguenti colonne (non tutte sono obbligatorie):
        </p>
        <ul>
          <li><strong>Patologia</strong> (obbligatorio) - Nome della patologia</li>
          <li><strong>Titolo</strong> - Titolo della recensione</li>
          <li><strong>Sintomi</strong> - Descrizione dei sintomi</li>
          <li><strong>Esperienza</strong> (obbligatorio) - Descrizione dell'esperienza</li>
          <li><strong>Difficoltà diagnosi</strong> - Valore da 1 a 5</li>
          <li><strong>Fastidio sintomi</strong> - Valore da 1 a 5</li>
          <li><strong>Cura Farmacologica</strong> - Y/N</li>
          <li><strong>Efficacia farmaci</strong> - Valore da 1 a 5</li>
          <li><strong>Possibilità guarigione</strong> - Valore da 1 a 5</li>
          <li><strong>Disagio sociale</strong> - Valore da 1 a 5</li>
          <li><strong>Data</strong> - Data della recensione (opzionale, default: data attuale)</li>
        </ul>
      </div>
    </div>
  );
};