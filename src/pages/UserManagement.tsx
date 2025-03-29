
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { ReviewsPagination } from "@/components/reviews/ReviewsPagination";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";

const ITEMS_PER_PAGE = 50;

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Use refetchOnMount: always to ensure data is always fetched when the component mounts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', currentPage],
    queryFn: async () => {
      console.log('Fetching users for admin panel, page:', currentPage);
      
      try {
        // Clear stale Supabase client state
        await supabase.auth.refreshSession();
        
        // First get total count
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Error getting users count:', countError);
          throw countError;
        }

        console.log('Total users count:', count);

        // Then get paginated data
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .range(from, to)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          throw error;
        }

        console.log('Fetched users:', users?.length);
        console.log('First few users:', users?.slice(0, 5));

        return {
          users: users || [],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error in user management query:', error);
        toast.error("Errore nel caricamento degli utenti. Riprova tra qualche secondo.");
        throw error;
      }
    },
    refetchOnMount: 'always', // Always refetch on mount
    staleTime: 0, // Don't cache
    gcTime: 0, // Changed from cacheTime to gcTime
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Force refetch when component mounts
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportExcel = () => {
    if (!data?.users) return;

    const exportData = data.users.map((user, index) => ({
      'N°': index + 1,
      'Username': user.username,
      'Email': user.email,
      'Anno di Nascita': user.birth_year,
      'Genere': user.gender,
      'Data Registrazione': format(new Date(user.created_at), 'dd/MM/yyyy')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utenti");
    XLSX.writeFile(wb, "utenti.xlsx");
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminHeader />
        <div className="text-center text-red-500">
          <p>Si è verificato un errore nel caricamento degli utenti.</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-4 flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Riprova
          </Button>
        </div>
      </div>
    );
  }

  const handleManualRefresh = () => {
    toast.info("Aggiornamento in corso...");
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Utenti</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleManualRefresh} variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Aggiorna
          </Button>
          <Button onClick={handleExportExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Esporta Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {!data?.users || data.users.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">Nessun utente trovato.</p>
              <Button 
                onClick={handleManualRefresh} 
                className="mt-4 flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" /> Aggiorna
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <p className="text-blue-800">
                  Totale utenti: {data.totalCount} | Pagina: {currentPage} di {data.totalPages}
                </p>
              </div>
              
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N°</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Anno di Nascita</TableHead>
                      <TableHead>Genere</TableHead>
                      <TableHead>Data Registrazione</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.birth_year}</TableCell>
                        <TableCell>{user.gender}</TableCell>
                        <TableCell>{format(new Date(user.created_at), 'dd/MM/yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data.totalPages > 1 && (
                <ReviewsPagination
                  currentPage={currentPage}
                  totalPages={data.totalPages}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
