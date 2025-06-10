
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
        "Patologia": "Diabete",
        "Titolo": "La mia esperienza con il diabete",
        "Esperienza": "Descrizione dettagliata dell'esperienza con la patologia...",
        "Sintomi": "Sete eccessiva, minzione frequente, affaticamento",
        "Difficoltà Diagnosi": 3,
        "Gravità Sintomi": 4,
        "Ha Farmaco": "Y",
        "Efficacia Farmaco": 4,
        "Possibilità Guarigione": 2,
        "Disagio Sociale": 3
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
