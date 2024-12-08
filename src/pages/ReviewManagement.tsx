import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReviewManagementTable } from "@/components/admin/ReviewManagementTable";
import * as XLSX from 'xlsx';

const ReviewManagement = () => {
  const handleExportExcel = () => {
    const storedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const exportData = storedReviews.map((review, index) => ({
      'N°': index + 1,
      'Titolo': review.title,
      'Autore': review.author || review.username,
      'Patologia': review.condition,
      'Data': review.date,
      'Stato': review.status === 'approved' ? 'Approvata' : 'In attesa',
      'Esperienza': review.experience
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recensioni");
    XLSX.writeFile(wb, "recensioni.xlsx");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Recensioni</h1>
        <Button onClick={handleExportExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Esporta Excel
        </Button>
      </div>

      <ReviewManagementTable />
    </div>
  );
};

export default ReviewManagement;
