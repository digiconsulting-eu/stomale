
import React from 'react';

export const UsersImportInstructions = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">Istruzioni per l'importazione utenti</h2>
      <p className="text-gray-600">
        Il file Excel deve contenere le seguenti colonne:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        <li><strong>Username</strong> (obbligatorio) - Nome utente</li>
        <li><strong>Email</strong> (opzionale) - Email dell'utente</li>
        <li><strong>Anno di Nascita</strong> - Anno di nascita</li>
        <li><strong>Genere</strong> - Genere (es. M, F)</li>
        <li><strong>Data Registrazione</strong> - Data di registrazione (opzionale)</li>
        <li><strong>GDPR Consent</strong> - Consenso GDPR (true/false)</li>
        <li><strong>ID</strong> - ID utente (opzionale, verrà generato automaticamente se non presente)</li>
      </ul>
      <p className="text-gray-600 mt-4">
        <strong>Note importanti:</strong>
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        <li>Se non specifichi un ID, verrà generato automaticamente un UUID</li>
        <li>Solo Username è obbligatorio</li>
        <li>L'email è opzionale ma deve essere unica nel sistema se fornita</li>
        <li>È necessario avere privilegi di amministratore per importare utenti</li>
      </ul>
    </div>
  );
};
