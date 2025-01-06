import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];

export const UsersTab = () => {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users for admin...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users for admin:', data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div>Caricamento utenti...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Anno di Nascita</TableHead>
              <TableHead>Genere</TableHead>
              <TableHead>Data Registrazione</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
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
    </div>
  );
};