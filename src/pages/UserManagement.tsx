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

const UserManagement = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('Fetching users for admin panel...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data);
      return data || [];
    }
  });

  const handleExportExcel = () => {
    if (!users) return;

    const exportData = users.map((user, index) => ({
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
              {users?.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
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
      )}
    </div>
  );
};

export default UserManagement;