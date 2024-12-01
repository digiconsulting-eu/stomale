import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Admin {
  id: string;
  email: string;
  dateAdded: string;
}

interface AdminsTabProps {
  admins: Admin[];
  newAdminEmail: string;
  setNewAdminEmail: (email: string) => void;
  handleAddAdmin: () => void;
}

export const AdminsTab = ({ admins, newAdminEmail, setNewAdminEmail, handleAddAdmin }: AdminsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          type="email"
          placeholder="Email del nuovo amministratore"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleAddAdmin}>Aggiungi Amministratore</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Data Aggiunta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.dateAdded}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};