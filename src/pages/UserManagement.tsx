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
import { useState } from "react";
import { ReviewsPagination } from "@/components/reviews/ReviewsPagination";

const ITEMS_PER_PAGE = 50;

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', currentPage],
    queryFn: async () => {
      console.log('Fetching users for admin panel, page:', currentPage);
      
      // First get total count
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Then get paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        users: users || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
      };
    },
    staleTime: 0,
    gcTime: 0
  });

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
        <div className="text-center text-red-500">
          Si è verificato un errore nel caricamento degli utenti.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Utenti</h1>
        <Button onClick={handleExportExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Esporta Excel
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
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
                {data?.users.map((user, index) => (
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

          {data?.totalPages > 1 && (
            <ReviewsPagination
              currentPage={currentPage}
              totalPages={data.totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;