import React from 'react';

export const ImportInstructions = () => (
  <div className="max-w-xl space-y-4">
    <h2 className="text-lg font-semibold">Importa Recensioni</h2>
    <p className="text-sm text-muted-foreground">
      Carica un file Excel (.xlsx) contenente le recensioni da importare.
      Il file deve contenere esattamente le seguenti colonne nell'ordine specificato:
    </p>
    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
      <li>Patologia</li>
      <li>Titolo</li>
      <li>Sintomi</li>
      <li>Esperienza</li>
      <li>Difficoltà di Diagnosi</li>
      <li>Quanto sono fastidiosi i sintomi</li>
      <li>Efficacia cura farmacologica</li>
      <li>Possibilità di guarigione</li>
      <li>Disagio sociale</li>
      <li>Data</li>
      <li>Nome Utente</li>
      <li>Email</li>
    </ul>
    <p className="text-sm text-muted-foreground mt-4">
      Nota: I nomi delle colonne devono corrispondere esattamente a quelli indicati sopra.
      Tutti i campi sono obbligatori.
    </p>
  </div>
);