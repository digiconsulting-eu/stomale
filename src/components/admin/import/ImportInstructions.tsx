export const ImportInstructions = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h3 className="font-semibold">Istruzioni per l'importazione:</h3>
      <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
        <li>Il file deve essere in formato Excel (.xlsx)</li>
        <li>Le colonne richieste sono:
          <ul className="list-disc pl-5 mt-1">
            <li>patologia (obbligatorio)</li>
            <li>title (opzionale)</li>
            <li>symptoms (opzionale)</li>
            <li>experience (obbligatorio)</li>
            <li>diagnosis_difficulty (opzionale, 1-5)</li>
            <li>symptoms_severity (opzionale, 1-5)</li>
            <li>has_medication (opzionale, Y/N)</li>
            <li>medication_effectiveness (opzionale, 1-5)</li>
            <li>healing_possibility (opzionale, 1-5)</li>
            <li>social_discomfort (opzionale, 1-5)</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};