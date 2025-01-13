import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReviewManagementTable } from "@/components/admin/ReviewManagementTable";
import * as XLSX from 'xlsx';
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ReviewManagement = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      console.log('Fetching reviews for admin...');
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          PATOLOGIE (
            Patologia
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      console.log('Fetched reviews:', data);
      return data || [];
    }
  });

  const handleExportExcel = () => {
    if (!reviews) return;

    const exportData = reviews.map((review, index) => ({
      'N°': index + 1,
      'Titolo': review.title,
      'Autore': review.username,
      'Patologia': review.PATOLOGIE?.Patologia,
      'Data': new Date(review.created_at).toLocaleDateString(),
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
      <AdminHeader />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Recensioni</h1>
        <Button onClick={handleExportExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Esporta Excel
        </Button>
      </div>

      <ReviewManagementTable reviews={reviews || []} isLoading={isLoading} />
    </div>
  );
};

export default ReviewManagement;