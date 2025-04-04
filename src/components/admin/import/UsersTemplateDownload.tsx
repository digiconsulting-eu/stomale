
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from "uuid";

export const UsersTemplateDownload = () => {
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    
    const data = [
      {
        "Username": "NuovoUtente",
        "Email": "esempio@email.com",
        "Anno di Nascita": "1990",
        "Genere": "M",
        "Data Registrazione": new Date().toISOString().split('T')[0],
        "GDPR Consent": true,
        "ID": uuidv4()
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(wb, ws, "Template Utenti");
    
    XLSX.writeFile(wb, "template_utenti.xlsx");
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
