import React from 'react';

export const ImportInstructions = () => (
  <div className="max-w-xl space-y-4">
    <h2 className="text-lg font-semibold">Importa Recensioni</h2>
    <p className="text-sm text-muted-foreground">
      Carica un file Excel (.xlsx) contenente le recensioni da importare.
      Il file deve contenere le seguenti colonne (solo Patologia ed Esperienza sono obbligatorie):
    </p>
    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
      <li><strong>Patologia</strong> (obbligatorio)</li>
      <li>Titolo</li>
      <li>Sintomi</li>
      <li><strong>Esperienza</strong> (obbligatorio)</li>
      <li>Difficoltà di Diagnosi (1-5)</li>
      <li>Quanto sono fastidiosi i sintomi (1-5)</li>
      <li>Efficacia cura farmacologica (1-5)</li>
      <li>Possibilità di guarigione (1-5)</li>
      <li>Disagio sociale (1-5)</li>
      <li>Data (DD-MM-YYYY)</li>
      <li>Nome Utente</li>
      <li>Email</li>
    </ul>
    <p className="text-sm text-muted-foreground mt-4">
      Nota: I nomi delle colonne devono corrispondere esattamente a quelli indicati sopra.
      I campi non obbligatori possono essere lasciati vuoti.
    </p>
  </div>
);