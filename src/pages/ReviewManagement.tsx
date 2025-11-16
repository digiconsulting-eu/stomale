
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReviewManagementTable } from "@/components/admin/ReviewManagementTable";
import * as XLSX from 'xlsx';
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const ReviewManagement = () => {
  const [searchParams] = useSearchParams();
  const { data: reviews, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      console.log('Fetching reviews for admin...');
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          toast.error("Errore nel caricamento delle recensioni");
          throw error;
        }

        if (!data || data.length === 0) {
          console.log('No reviews found');
          return [];
        }

        console.log('Fetched reviews:', data.length, 'items');
        console.log('Sample review:', data[0]);
        return data;
      } catch (err) {
        console.error('Unexpected error in review fetch:', err);
        toast.error("Si è verificato un errore nel caricamento delle recensioni");
        throw err;
      }
    },
    staleTime: 0, // Always fetch fresh data
    retry: 2,
    refetchOnWindowFocus: false
  });

  const handleExportExcel = () => {
    if (!reviews || reviews.length === 0) {
      toast.error("Nessuna recensione da esportare");
      return;
    }

    const exportData = reviews.map((review, index) => ({
      'N°': index + 1,
      'Titolo': review.title,
      'Autore': review.username,
      'Patologia': review.PATOLOGIE?.Patologia || 'Non specificata',
      'Data': new Date(review.created_at).toLocaleDateString(),
      'Stato': review.status === 'approved' ? 'Approvata' : 'In attesa',
      'Esperienza': review.experience
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recensioni");
    XLSX.writeFile(wb, "recensioni.xlsx");
  };

  // Attempt to refresh data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Scroll to highlighted review if present in URL
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      setTimeout(() => {
        const element = document.getElementById(`review-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, reviews]);

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Recensioni</h1>
        <Button 
          onClick={handleExportExcel} 
          className="gap-2"
          disabled={!reviews || reviews.length === 0}
        >
          <Download className="h-4 w-4" />
          Esporta Excel
        </Button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg my-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Errore nel caricamento delle recensioni</h3>
          <p className="text-red-700 mb-4">Si è verificato un errore durante il caricamento delle recensioni.</p>
          <Button onClick={() => refetch()} variant="outline" className="border-red-400 text-red-600">
            Riprova
          </Button>
        </div>
      ) : (
        <ReviewManagementTable reviews={reviews || []} isLoading={isLoading} />
      )}
    </div>
  );
};

export default ReviewManagement;
