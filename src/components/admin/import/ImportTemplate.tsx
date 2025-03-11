
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

export const ImportTemplate = () => {
  const downloadTemplate = () => {
    // Creazione di un nuovo foglio Excel
    const wb = XLSX.utils.book_new();
    
    // Definizione dei dati di esempio
    const data = [
      {
        "Patologia": "Nome Patologia",
        "Titolo": "Titolo della recensione",
        "Esperienza": "Descrizione dettagliata dell'esperienza",
        "Sintomi": "Descrizione dei sintomi",
        "Difficoltà diagnosi": 3,
        "Fastidio sintomi": 4,
        "Cura Farmacologica": "Y",
        "Efficacia farmaci": 4,
        "Possibilità guarigione": 2,
        "Disagio sociale": 3,
        "Data": new Date().toISOString().split('T')[0],
        "User ID": "id-utente-specifico" // Campo aggiunto per specificare l'utente
      }
    ];
    
    // Conversione in foglio di lavoro
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Aggiunta del foglio al libro
    XLSX.utils.book_append_sheet(wb, ws, "Template Recensioni");
    
    // Download del file
    XLSX.writeFile(wb, "template_recensioni.xlsx");
  };

  return (
    <Button
      onClick={downloadTemplate}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Scarica Template Excel
    </Button>
  );
};
