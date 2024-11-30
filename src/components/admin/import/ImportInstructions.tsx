import React from 'react';

export const ImportInstructions = () => (
  <div className="max-w-xl space-y-4">
    <h2 className="text-lg font-semibold">Importa Recensioni</h2>
    <p className="text-sm text-muted-foreground">
      Carica un file Excel (.xlsx) contenente le recensioni da importare.
      Il file deve contenere i seguenti campi nell'ordine specificato:
    </p>
    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
      <li>Patologia (testo)</li>
      <li>Titolo (testo)</li>
      <li>Sintomi (testo)</li>
      <li>Esperienza (testo)</li>
      <li>Difficoltà di Diagnosi (voto da 1 a 5)</li>
      <li>Quanto sono fastidiosi i sintomi? (voto da 1 a 5)</li>
      <li>Efficacia cura farmacologica (voto da 1 a 5)</li>
      <li>Possibilità di guarigione (voto da 1 a 5)</li>
      <li>Disagio sociale (voto da 1 a 5)</li>
      <li>Data (formato DD-MM-YYYY)</li>
      <li>Nome Utente (testo)</li>
      <li>Email (formato valido)</li>
    </ul>
  </div>
);